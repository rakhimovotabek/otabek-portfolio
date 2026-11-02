-- Additive CMS extension. Existing identity, MFA, inbox and moderation are untouched.
create table public.portfolio_content (
 kind text not null check(kind in ('project','journal','photo','album','settings')),
 slug text not null check(slug ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
 title text not null check(char_length(title) between 1 and 200),
 body text not null default '' check(char_length(body)<=50000),
 excerpt text not null default '' check(char_length(excerpt)<=500),
 image text not null default '' check(image='' or image like 'https://%' or image like '/projects/%'),
 url text not null default '' check(url='' or url like 'https://%'),
 album text not null default '', position integer not null default 0,
 published boolean not null default false, updated_at timestamptz not null default now(),
 primary key(kind,slug)
);
alter table public.portfolio_content enable row level security;
revoke all on public.portfolio_content from anon,authenticated;
grant select on public.portfolio_content to anon,authenticated;
grant insert,update,delete on public.portfolio_content to authenticated;
create policy published_content on public.portfolio_content for select using(published);
create policy owner_content on public.portfolio_content for all to authenticated using((select public.is_portfolio_owner())) with check((select public.is_portfolio_owner()));
insert into public.portfolio_content(kind,slug,title,body,excerpt,image,url,position,published) values
('project','satchi','SAT''chi','SAT learning and practice: question banks, books, homework, vocabulary, battles and progress tracking.','SAT learning tools','/projects/satchi-concept-a.webp','https://satchi.vercel.app/',0,true),
('project','huquqchi','Huquqchi','A legal education and testing platform.','Legal education and testing','/projects/huquqchi-concept-a.webp','https://yangiariq-yuridik-senter.netlify.app/',1,true);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('portfolio-media','portfolio-media',true,4194304,array['image/jpeg','image/png','image/webp','image/avif']) on conflict(id) do nothing;
create policy portfolio_media_read on storage.objects for select using(bucket_id='portfolio-media');
create policy portfolio_media_owner_insert on storage.objects for insert to authenticated with check(bucket_id='portfolio-media' and (select public.is_portfolio_owner()));
create policy portfolio_media_owner_delete on storage.objects for delete to authenticated using(bucket_id='portfolio-media' and (select public.is_portfolio_owner()));
