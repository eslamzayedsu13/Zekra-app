
create type public.app_role as enum ('admin','user');
create type public.order_status as enum ('pending','confirmed','processing','shipped','delivered','cancelled');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique(user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.user_roles where user_id=_user_id and role=_role)
$$;
create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  email text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, full_name, email) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), new.email);
  insert into public.user_roles(user_id, role) values (new.id, 'user');
  if not exists (select 1 from public.user_roles where role='admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_ar text not null,
  name_en text not null,
  sort int not null default 0
);
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "categories public" on public.categories for select to anon, authenticated using (true);
create policy "categories admin write" on public.categories for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  category_id uuid references public.categories(id) on delete set null,
  name_ar text not null,
  name_en text not null,
  description_ar text not null default '',
  description_en text not null default '',
  price int not null check (price >= 0),
  compare_at_price int,
  stock int not null default 0 check (stock >= 0),
  images text[] not null default '{}',
  featured boolean not null default false,
  bestseller boolean not null default false,
  sales_count int not null default 0,
  allow_engraving boolean not null default false,
  engraving_price int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "products public" on public.products for select to anon, authenticated using (active or public.has_role(auth.uid(),'admin'));
create policy "products admin write" on public.products for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name_ar text not null,
  name_en text not null,
  price_delta int not null default 0,
  stock int not null default 0 check (stock >= 0),
  sort int not null default 0
);
grant select on public.product_variants to anon, authenticated;
grant insert, update, delete on public.product_variants to authenticated;
grant all on public.product_variants to service_role;
alter table public.product_variants enable row level security;
create policy "variants public" on public.product_variants for select to anon, authenticated using (true);
create policy "variants admin write" on public.product_variants for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.shipping_rates (
  governorate text primary key,
  name_ar text not null,
  fee int not null,
  eta_days text not null default '2-4'
);
grant select on public.shipping_rates to anon, authenticated;
grant insert, update, delete on public.shipping_rates to authenticated;
grant all on public.shipping_rates to service_role;
alter table public.shipping_rates enable row level security;
create policy "rates public" on public.shipping_rates for select to anon, authenticated using (true);
create policy "rates admin" on public.shipping_rates for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  full_name text not null,
  phone text not null,
  governorate text not null references public.shipping_rates(governorate),
  city text not null,
  street text not null,
  notes text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.addresses to authenticated;
grant all on public.addresses to service_role;
alter table public.addresses enable row level security;
create policy "own addresses" on public.addresses for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.wishlists (
  user_id uuid not null,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);
grant select, insert, delete on public.wishlists to authenticated;
grant all on public.wishlists to service_role;
alter table public.wishlists enable row level security;
create policy "own wishlist" on public.wishlists for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create sequence public.order_number_seq start 10001;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint not null unique default nextval('public.order_number_seq'),
  user_id uuid not null,
  idempotency_key uuid not null unique,
  status order_status not null default 'pending',
  payment_method text not null default 'cod',
  payment_status text not null default 'unpaid',
  contact_name text not null,
  contact_phone text not null,
  contact_email text,
  governorate text not null,
  city text not null,
  street text not null,
  address_notes text,
  gift_wrap boolean not null default false,
  greeting_card boolean not null default false,
  gift_message text,
  subtotal int not null,
  extras_total int not null default 0,
  shipping_fee int not null,
  total int not null,
  created_at timestamptz not null default now()
);
grant select, update on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "own orders read" on public.orders for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admin orders update" on public.orders for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  name_ar text not null,
  name_en text not null,
  variant_ar text,
  variant_en text,
  image text,
  unit_price int not null,
  engraving_text text,
  engraving_price int not null default 0,
  quantity int not null check (quantity > 0),
  line_total int not null
);
grant select on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;
create policy "own items read" on public.order_items for select to authenticated using (exists(select 1 from public.orders o where o.id=order_id and (o.user_id=auth.uid() or public.has_role(auth.uid(),'admin'))));

create table public.order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status order_status not null,
  created_at timestamptz not null default now()
);
grant select on public.order_status_events to authenticated;
grant all on public.order_status_events to service_role;
alter table public.order_status_events enable row level security;
create policy "own events read" on public.order_status_events for select to authenticated using (exists(select 1 from public.orders o where o.id=order_id and (o.user_id=auth.uid() or public.has_role(auth.uid(),'admin'))));

create or replace function public.on_order_status_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare it record;
begin
  -- only status may change after creation (admin edits)
  if auth.uid() is not null and (new.total <> old.total or new.user_id <> old.user_id or new.subtotal <> old.subtotal or new.shipping_fee <> old.shipping_fee) then
    raise exception 'ORDER_LOCKED';
  end if;
  if new.status is distinct from old.status then
    if old.status = 'cancelled' then raise exception 'Cancelled orders cannot be reopened'; end if;
    insert into public.order_status_events(order_id, status) values (new.id, new.status);
    if new.status = 'cancelled' then
      for it in select * from public.order_items where order_id = new.id loop
        if it.variant_id is not null then
          update public.product_variants set stock = stock + it.quantity where id = it.variant_id;
        elsif it.product_id is not null then
          update public.products set stock = stock + it.quantity where id = it.product_id;
        end if;
        if it.product_id is not null then
          update public.products set sales_count = greatest(0, sales_count - it.quantity) where id = it.product_id;
        end if;
      end loop;
    end if;
  end if;
  return new;
end $$;
create trigger order_status_change before update on public.orders for each row execute function public.on_order_status_change();

create or replace function public.place_order(payload jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  existing record;
  rate record;
  item jsonb;
  p record;
  v_id uuid;
  v_ar text;
  v_en text;
  v_delta int;
  v_stock int;
  qty int;
  unit int;
  engr text;
  engr_price int;
  sub int := 0;
  extras int := 0;
  ship int;
  new_order_id uuid;
  new_number bigint;
  wrap boolean := coalesce((payload->>'gift_wrap')::boolean, false);
  card boolean := coalesce((payload->>'greeting_card')::boolean, false);
  key uuid := (payload->>'idempotency_key')::uuid;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if key is null then raise exception 'INVALID_REQUEST'; end if;

  select id, order_number into existing from public.orders where idempotency_key = key and user_id = uid;
  if found then return jsonb_build_object('id', existing.id, 'order_number', existing.order_number, 'duplicate', true); end if;

  if jsonb_typeof(payload->'items') <> 'array' or jsonb_array_length(payload->'items') = 0 or jsonb_array_length(payload->'items') > 50 then
    raise exception 'EMPTY_CART';
  end if;
  if length(coalesce(trim(payload->>'contact_name'),'')) < 2 or length(payload->>'contact_name') > 120 then raise exception 'INVALID_NAME'; end if;
  if coalesce(payload->>'contact_phone','') !~ '^01[0125][0-9]{8}$' then raise exception 'INVALID_PHONE'; end if;
  if length(coalesce(trim(payload->>'city'),'')) < 2 or length(coalesce(trim(payload->>'street'),'')) < 4 then raise exception 'INVALID_ADDRESS'; end if;
  if length(coalesce(payload->>'gift_message','')) > 300 then raise exception 'MESSAGE_TOO_LONG'; end if;
  if coalesce(payload->>'payment_method','cod') <> 'cod' then raise exception 'PAYMENT_UNAVAILABLE'; end if;

  select * into rate from public.shipping_rates where governorate = payload->>'governorate';
  if not found then raise exception 'INVALID_GOVERNORATE'; end if;

  insert into public.orders(user_id, idempotency_key, contact_name, contact_phone, contact_email, governorate, city, street, address_notes, gift_wrap, greeting_card, gift_message, subtotal, extras_total, shipping_fee, total)
  values (uid, key, trim(payload->>'contact_name'), payload->>'contact_phone', nullif(payload->>'contact_email',''), rate.governorate, trim(payload->>'city'), trim(payload->>'street'), nullif(left(payload->>'address_notes',300),''), wrap, card, nullif(left(trim(coalesce(payload->>'gift_message','')),300),''), 0,0,0,0)
  returning id, order_number into new_order_id, new_number;

  for item in select * from jsonb_array_elements(payload->'items') loop
    qty := (item->>'quantity')::int;
    if qty is null or qty < 1 or qty > 20 then raise exception 'INVALID_QUANTITY'; end if;
    select * into p from public.products where id = (item->>'product_id')::uuid and active for update;
    if not found then raise exception 'PRODUCT_UNAVAILABLE'; end if;
    unit := p.price;
    v_id := null; v_ar := null; v_en := null;
    if nullif(item->>'variant_id','') is not null then
      select id, name_ar, name_en, price_delta, stock into v_id, v_ar, v_en, v_delta, v_stock
        from public.product_variants where id = (item->>'variant_id')::uuid and product_id = p.id for update;
      if v_id is null then raise exception 'VARIANT_UNAVAILABLE'; end if;
      if v_stock < qty then raise exception 'OUT_OF_STOCK'; end if;
      update public.product_variants set stock = stock - qty where id = v_id;
      unit := unit + v_delta;
    else
      if exists(select 1 from public.product_variants where product_id = p.id) then raise exception 'VARIANT_REQUIRED'; end if;
      if p.stock < qty then raise exception 'OUT_OF_STOCK'; end if;
      update public.products set stock = stock - qty where id = p.id;
    end if;
    engr := nullif(trim(coalesce(item->>'engraving','')),'');
    engr_price := 0;
    if engr is not null then
      if not p.allow_engraving then raise exception 'ENGRAVING_UNAVAILABLE'; end if;
      if length(engr) > 24 then raise exception 'ENGRAVING_TOO_LONG'; end if;
      engr_price := p.engraving_price;
    end if;
    update public.products set sales_count = sales_count + qty where id = p.id;
    insert into public.order_items(order_id, product_id, variant_id, name_ar, name_en, variant_ar, variant_en, image, unit_price, engraving_text, engraving_price, quantity, line_total)
    values (new_order_id, p.id, v_id, p.name_ar, p.name_en, v_ar, v_en, p.images[1], unit, engr, engr_price, qty, (unit + engr_price) * qty);
    sub := sub + (unit + engr_price) * qty;
  end loop;

  extras := (case when wrap then 75 else 0 end) + (case when card then 40 else 0 end);
  ship := case when sub >= 3000 then 0 else rate.fee end;
  update public.orders set subtotal = sub, extras_total = extras, shipping_fee = ship, total = sub + extras + ship where id = new_order_id;
  insert into public.order_status_events(order_id, status) values (new_order_id, 'pending');
  return jsonb_build_object('id', new_order_id, 'order_number', new_number, 'duplicate', false);
end $$;
revoke all on function public.place_order(jsonb) from public, anon;
grant execute on function public.place_order(jsonb) to authenticated;

insert into public.shipping_rates(governorate, name_ar, fee, eta_days) values
('Cairo','القاهرة',60,'1-2'),('Giza','الجيزة',60,'1-2'),('Alexandria','الإسكندرية',70,'2-3'),('Qalyubia','القليوبية',70,'2-3'),
('Dakahlia','الدقهلية',80,'2-4'),('Sharqia','الشرقية',80,'2-4'),('Gharbia','الغربية',80,'2-4'),('Monufia','المنوفية',80,'2-4'),
('Beheira','البحيرة',80,'2-4'),('Kafr El Sheikh','كفر الشيخ',80,'2-4'),('Damietta','دمياط',80,'2-4'),('Port Said','بورسعيد',80,'2-4'),
('Ismailia','الإسماعيلية',80,'2-4'),('Suez','السويس',80,'2-4'),('Faiyum','الفيوم',90,'3-5'),('Beni Suef','بني سويف',90,'3-5'),
('Minya','المنيا',95,'3-5'),('Asyut','أسيوط',95,'3-5'),('Sohag','سوهاج',95,'3-5'),('Qena','قنا',100,'4-6'),('Luxor','الأقصر',100,'4-6'),
('Aswan','أسوان',100,'4-6'),('Red Sea','البحر الأحمر',120,'4-7'),('Matrouh','مطروح',120,'4-7'),('New Valley','الوادي الجديد',120,'5-7'),
('North Sinai','شمال سيناء',120,'5-7'),('South Sinai','جنوب سيناء',120,'4-7');

insert into public.categories(slug,name_ar,name_en,sort) values
('engagement','للخطوبة','For the Engagement',1),('keepsakes','تذكارات','Keepsakes',2),('jewelry','مجوهرات','Jewelry',3),('home','للبيت','Home & Ritual',4),('accessories','إكسسوارات','Accessories',5);

insert into public.products(slug,category_id,name_ar,name_en,description_ar,description_en,price,compare_at_price,stock,images,featured,bestseller,sales_count,allow_engraving,engraving_price) values
('engraved-ring-dish',(select id from categories where slug='engagement'),'طبق الخواتم المحفور','Engraved Ring Dish','طبق خزفي مصنوع يدويًا يحفظ خاتمَي الخطوبة، مع إمكانية حفر الأحرف الأولى وتاريخ اليوم الذي بدأ فيه كل شيء.','A hand-thrown ceramic dish to hold your engagement rings, with optional engraving of your initials and the date it all began.',650,null,40,'{ringdish,giftbox}',true,true,212,true,120),
('couples-journal',(select id from categories where slug='keepsakes'),'دفتر الحكاية المشتركة','The Shared Story Journal','دفتر مجلّد بالكتان بأسئلة موجّهة لتكتبا معًا حكايتكما منذ اللقاء الأول وحتى الزفاف.','A linen-bound journal with guided prompts for writing your story together, from the first meeting to the wedding day.',780,950,55,'{journal,giftbox}',true,true,341,true,90),
('initial-necklace',(select id from categories where slug='jewelry'),'قلادة الحرف الأول','Initial Pendant Necklace','قلادة رقيقة من الفضة المطلية بذهب عيار ١٨ بحرف أول من اختيارك.','A delicate 18k gold-plated sterling silver necklace carrying an initial of your choice.',1450,null,0,'{necklace,box}',true,true,288,false,0),
('star-map-print',(select id from categories where slug='keepsakes'),'خريطة نجوم ليلتكما','Your Night Sky Star Map','طبعة فنية لسماء الليلة التي التقيتما فيها، بالتاريخ والمدينة، في إطار من خشب البلوط.','A fine-art print of the sky on the night you met, with date and city, in a solid oak frame.',1850,null,0,'{starmap,frame}',true,false,164,true,0),
('pressed-flower-frame',(select id from categories where slug='home'),'إطار الزهور المجففة','Pressed Flower Frame','زهور برية مجففة يدويًا بين لوحين من الزجاج في إطار نحاسي نحيف.','Hand-pressed wildflowers between two panes of glass in a slim brass frame.',1250,null,22,'{frame,starmap}',false,true,197,false,0),
('candle-duo',(select id from categories where slug='home'),'ثنائي الشموع المعطرة','Scented Candle Duo','شمعتان من شمع الصويا بعطر زهر البرتقال والمسك الأبيض، تُصبّان يدويًا في أوعية خزفية.','Two hand-poured soy candles in orange blossom and white musk, set in ceramic vessels.',890,null,60,'{candle,giftbox}',true,true,402,false,0),
('silk-scrunchie-set',(select id from categories where slug='accessories'),'طقم ربطات الحرير','Silk Scrunchie Set','ثلاث ربطات شعر من الحرير الطبيعي بألوان العاج والوردي الترابي والمريمية.','Three pure mulberry silk scrunchies in ivory, dusty rose and sage.',450,null,80,'{silk,giftbox}',false,true,356,false,0),
('leather-keepsake-box',(select id from categories where slug='keepsakes'),'صندوق الذكريات الجلدي','Leather Keepsake Box','صندوق من الجلد الطبيعي ببطانة حريرية لحفظ الرسائل والتذاكر وكل ما لا يُنسى.','A full-grain leather box with silk lining for letters, tickets and everything worth keeping.',2650,2950,0,'{box,journal}',true,false,98,true,150),
('engagement-gift-box',(select id from categories where slug='engagement'),'صندوق هدية الخطوبة','The Engagement Gift Box','صندوق منسّق يضم دفتر الحكاية وشمعة وطبق الخواتم، ملفوف بورق عاجي وشريط حريري.','A curated box with the story journal, a candle and the ring dish, wrapped in ivory paper and silk ribbon.',2950,3420,15,'{giftbox,ringdish,journal}',true,true,143,true,120),
('promise-bracelet',(select id from categories where slug='jewelry'),'سوار الوعد','Promise Bracelet','سوار رفيع بسلسلة ناعمة وقرص صغير يمكن حفره باسم أو تاريخ.','A fine chain bracelet with a small disc that can carry a name or a date.',1150,null,0,'{necklace,box}',false,false,77,true,100),
('wedding-guest-book',(select id from categories where slug='engagement'),'دفتر ضيوف الفرح','Wedding Guest Book','دفتر كبير بورق قطني سميك لتجمعا فيه كلمات الأحبة يوم الفرح.','A large book of heavy cotton paper to gather the words of loved ones on your wedding day.',1350,null,30,'{journal,frame}',false,false,64,true,90),
('love-letters-set',(select id from categories where slug='keepsakes'),'طقم رسائل الحب','Love Letters Set','اثنتا عشرة بطاقة وظرفًا من الورق القطني مع ختم شمعي، لرسالة في كل شهر من السنة الأولى.','Twelve cotton-paper cards and envelopes with a wax seal—one letter for each month of your first year.',590,null,70,'{giftbox,journal}',false,true,231,false,0),
('silk-eye-mask',(select id from categories where slug='accessories'),'قناع النوم الحريري','Silk Sleep Mask','قناع نوم من الحرير الطبيعي، ناعم على البشرة ومثالي لهدايا السفر وشهر العسل.','A pure silk sleep mask, gentle on the skin and perfect for travel and the honeymoon.',520,null,45,'{silk,candle}',false,false,88,false,0),
('ceramic-vase',(select id from categories where slug='home'),'مزهرية خزفية صغيرة','Small Ceramic Bud Vase','مزهرية مصنوعة يدويًا بلمسة غير منتظمة، لزهرة واحدة أو غصن مجفف.','A hand-made bud vase with an irregular finish, for a single stem or a dried branch.',480,null,35,'{frame,candle}',false,false,59,false,0),
('anniversary-candle',(select id from categories where slug='home'),'شمعة الذكرى السنوية','Anniversary Candle','شمعة كبيرة بثلاث فتائل وملصق مخصّص بأسمائكما وتاريخكما.','A large three-wick candle with a custom label carrying your names and date.',760,null,40,'{candle,giftbox}',false,false,72,true,60),
('pearl-hair-clip',(select id from categories where slug='accessories'),'مشبك اللؤلؤ','Pearl Hair Clip','مشبك شعر نحاسي مرصّع بلآلئ المياه العذبة، لمسة ناعمة ليوم الخطوبة.','A brass hair clip set with freshwater pearls, a soft touch for the engagement day.',380,null,50,'{silk,necklace}',false,false,121,false,0);

insert into public.product_variants(product_id,name_ar,name_en,price_delta,stock,sort)
select p.id, v.ar, v.en, v.delta, v.stock, v.sort from public.products p,
 (values ('initial-necklace','ذهبي — ٤٠ سم','Gold — 40 cm',0,25,1),('initial-necklace','ذهبي — ٤٥ سم','Gold — 45 cm',0,18,2),('initial-necklace','فضي — ٤٥ سم','Silver — 45 cm',-200,12,3),
         ('star-map-print','٣٠×٤٠ سم','30×40 cm',0,30,1),('star-map-print','٥٠×٧٠ سم','50×70 cm',900,14,2),
         ('leather-keepsake-box','وردي ترابي','Dusty Rose',0,9,1),('leather-keepsake-box','فحمي','Charcoal',0,6,2),
         ('promise-bracelet','ذهبي','Gold',0,20,1),('promise-bracelet','فضي','Silver',-150,15,2)) as v(slug,ar,en,delta,stock,sort)
where p.slug = v.slug;
