--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4 (Debian 17.4-1.pgdg120+2)
-- Dumped by pg_dump version 17.0

-- Started on 2025-07-10 12:22:17

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 3409 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 16422)
-- Name: accounts; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.accounts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    name character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.accounts OWNER TO admin;

--
-- TOC entry 220 (class 1259 OID 16436)
-- Name: categories; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.categories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    name character varying NOT NULL,
    type character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT categories_type_check CHECK (((type)::text = ANY ((ARRAY['INCOME'::character varying, 'EXPENSE'::character varying])::text[])))
);


ALTER TABLE public.categories OWNER TO admin;

--
-- TOC entry 221 (class 1259 OID 16451)
-- Name: transactions; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.transactions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    account_id uuid,
    category_id uuid,
    amount numeric(12,2) NOT NULL,
    transaction_date date NOT NULL,
    note_cleaned text,
    slip_path text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.transactions OWNER TO admin;

--
-- TOC entry 218 (class 1259 OID 16412)
-- Name: users; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    username character varying NOT NULL,
    password_hash text NOT NULL
);


ALTER TABLE public.users OWNER TO admin;

--
-- TOC entry 3401 (class 0 OID 16422)
-- Dependencies: 219
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.accounts VALUES ('e6429481-b12e-4a15-9467-9eacc91b045d', '26eb88f7-cabd-4d0d-b745-eba5299fdacb', 'hello1', '2025-07-08 15:38:45.602714');
INSERT INTO public.accounts VALUES ('926fcc1d-5607-4eeb-9754-8309a20174af', '26eb88f7-cabd-4d0d-b745-eba5299fdacb', 'hello2', '2025-07-08 15:38:48.695264');
INSERT INTO public.accounts VALUES ('bf7c87e4-c20d-416f-a297-6b8b6d55a294', '70cf813c-50ff-4230-b9b8-be7ec22876da', 'Admin_account1', '2025-07-08 15:36:43.684242');
INSERT INTO public.accounts VALUES ('6a8dc2bf-ad0a-4066-8d08-43ae060c8f24', '70cf813c-50ff-4230-b9b8-be7ec22876da', 'Admin_account2', '2025-07-08 15:36:50.45048');
INSERT INTO public.accounts VALUES ('193b73ab-4591-42f6-81ca-9c0ec259b640', '70cf813c-50ff-4230-b9b8-be7ec22876da', 'Admin_account3', '2025-07-08 15:36:54.655978');


--
-- TOC entry 3402 (class 0 OID 16436)
-- Dependencies: 220
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.categories VALUES ('b63232e8-3a99-49fc-9a9f-6ec4ea28d9d9', '26eb88f7-cabd-4d0d-b745-eba5299fdacb', 'Transportation', 'EXPENSE', '2025-07-08 17:49:15.85549');
INSERT INTO public.categories VALUES ('5e287adb-8d71-439b-97f1-d41d105683af', '26eb88f7-cabd-4d0d-b745-eba5299fdacb', 'Rent', 'EXPENSE', '2025-07-08 17:49:29.074409');
INSERT INTO public.categories VALUES ('a23189a9-9caa-4ee4-a491-2f642e7296e4', 'b6f9fdb3-0868-493c-8605-e3e5be962d30', 'Food', 'EXPENSE', '2025-07-08 17:52:51.798065');
INSERT INTO public.categories VALUES ('53b06000-b0a0-41a9-b1ed-a22a07c2b8c9', '26eb88f7-cabd-4d0d-b745-eba5299fdacb', 'Food', 'EXPENSE', '2025-07-08 18:05:14.519305');
INSERT INTO public.categories VALUES ('4810aca1-b851-4190-81f9-c4c1e6ceffab', '70cf813c-50ff-4230-b9b8-be7ec22876da', 'Admin_Transportation', 'EXPENSE', '2025-07-09 11:46:05.148999');
INSERT INTO public.categories VALUES ('6f0d84cd-73b0-4e7b-bc69-c43618980cef', '70cf813c-50ff-4230-b9b8-be7ec22876da', 'Admin_Food', 'EXPENSE', '2025-07-08 20:02:18.833337');
INSERT INTO public.categories VALUES ('760e9262-6018-48d9-ba85-75751af0cd8d', '70cf813c-50ff-4230-b9b8-be7ec22876da', 'Admin_Salary', 'INCOME', '2025-07-09 11:46:56.935575');
INSERT INTO public.categories VALUES ('c7e56d67-2e83-468c-8cc5-040ea8bea9ff', '70cf813c-50ff-4230-b9b8-be7ec22876da', 'Admin_Accident', 'EXPENSE', '2025-07-09 14:00:34.202244');
INSERT INTO public.categories VALUES ('37dde6e5-a215-4e52-964b-038c81e7f9f0', '70cf813c-50ff-4230-b9b8-be7ec22876da', 'Admin_General', 'EXPENSE', '2025-07-10 12:02:27.186204');


--
-- TOC entry 3403 (class 0 OID 16451)
-- Dependencies: 221
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.transactions VALUES ('d25ed05c-b4f6-4359-b51e-8b5c45a4c891', '70cf813c-50ff-4230-b9b8-be7ec22876da', '6a8dc2bf-ad0a-4066-8d08-43ae060c8f24', '760e9262-6018-48d9-ba85-75751af0cd8d', 30000.00, '2025-07-08', 'เงินเดือนเข้าแล้วจ้าา', NULL, '2025-07-09 11:49:26.808376');
INSERT INTO public.transactions VALUES ('fa71f514-65d1-478a-81f4-7cc7ae3ceea3', '70cf813c-50ff-4230-b9b8-be7ec22876da', 'bf7c87e4-c20d-416f-a297-6b8b6d55a294', '6f0d84cd-73b0-4e7b-bc69-c43618980cef', 300.00, '2025-07-08', 'ค่าอาหารกลางวันนะครับ', NULL, '2025-07-08 23:12:39.726102');
INSERT INTO public.transactions VALUES ('a3084208-23b0-4a3e-9f16-a65ec8f4655f', '70cf813c-50ff-4230-b9b8-be7ec22876da', 'bf7c87e4-c20d-416f-a297-6b8b6d55a294', 'c7e56d67-2e83-468c-8cc5-040ea8bea9ff', 10000.00, '2025-07-08', '****, my car', '1751992989992.jpg', '2025-07-08 23:00:25.424407');
INSERT INTO public.transactions VALUES ('fff626b3-1dcd-4aba-9de6-a655a9852f82', '26eb88f7-cabd-4d0d-b745-eba5299fdacb', 'e6429481-b12e-4a15-9467-9eacc91b045d', '53b06000-b0a0-41a9-b1ed-a22a07c2b8c9', 600.00, '2025-07-08', 'hello gift some food jaaa', '1751993867772.jpg', '2025-07-08 23:55:36.951325');
INSERT INTO public.transactions VALUES ('e8e7f132-fbbd-42b1-adca-e5d92030ad3e', '70cf813c-50ff-4230-b9b8-be7ec22876da', '6a8dc2bf-ad0a-4066-8d08-43ae060c8f24', '760e9262-6018-48d9-ba85-75751af0cd8d', 30000.00, '2024-09-01', 'เงินเดือนเข้าแล้วจ้าา1', NULL, '2025-07-10 00:11:56.097818');
INSERT INTO public.transactions VALUES ('b129eec3-5e06-4035-8b16-55559133a597', '70cf813c-50ff-4230-b9b8-be7ec22876da', '6a8dc2bf-ad0a-4066-8d08-43ae060c8f24', '760e9262-6018-48d9-ba85-75751af0cd8d', 30000.00, '2024-10-01', 'เงินเดือนเข้าแล้วจ้าา2', NULL, '2025-07-10 00:11:56.097818');
INSERT INTO public.transactions VALUES ('0f263006-45fe-4155-bae4-3d40c24c6d0e', '70cf813c-50ff-4230-b9b8-be7ec22876da', '6a8dc2bf-ad0a-4066-8d08-43ae060c8f24', '760e9262-6018-48d9-ba85-75751af0cd8d', 30000.00, '2024-11-01', 'เงินเดือนเข้าแล้วจ้าา3', NULL, '2025-07-10 00:11:56.097818');
INSERT INTO public.transactions VALUES ('3bfe5984-4f6f-40bf-a43e-eeb628adb2a1', '70cf813c-50ff-4230-b9b8-be7ec22876da', '6a8dc2bf-ad0a-4066-8d08-43ae060c8f24', '760e9262-6018-48d9-ba85-75751af0cd8d', 30000.00, '2024-12-01', 'เงินเดือนเข้าแล้วจ้าา4', NULL, '2025-07-10 00:11:56.097818');
INSERT INTO public.transactions VALUES ('3a57b9f2-adcc-4cc0-beeb-0d76337f5f15', '70cf813c-50ff-4230-b9b8-be7ec22876da', '6a8dc2bf-ad0a-4066-8d08-43ae060c8f24', '760e9262-6018-48d9-ba85-75751af0cd8d', 30000.00, '2025-01-01', 'เงินเดือนเข้าแล้วจ้าา5', NULL, '2025-07-10 00:11:56.097818');
INSERT INTO public.transactions VALUES ('cc18bdd1-ff04-4d3a-b0f6-69c0b6109a1a', '70cf813c-50ff-4230-b9b8-be7ec22876da', '6a8dc2bf-ad0a-4066-8d08-43ae060c8f24', '760e9262-6018-48d9-ba85-75751af0cd8d', 30000.00, '2025-02-01', 'เงินเดือนเข้าแล้วจ้าา6', NULL, '2025-07-10 00:11:56.097818');
INSERT INTO public.transactions VALUES ('e483090e-22d2-48e1-94c3-edd0c8160cf2', '70cf813c-50ff-4230-b9b8-be7ec22876da', '6a8dc2bf-ad0a-4066-8d08-43ae060c8f24', '760e9262-6018-48d9-ba85-75751af0cd8d', 30000.00, '2025-03-01', 'เงินเดือนเข้าแล้วจ้าา7', NULL, '2025-07-10 00:11:56.097818');
INSERT INTO public.transactions VALUES ('77060b98-0534-4c7b-aeab-103270addbc8', '70cf813c-50ff-4230-b9b8-be7ec22876da', '6a8dc2bf-ad0a-4066-8d08-43ae060c8f24', '760e9262-6018-48d9-ba85-75751af0cd8d', 30000.00, '2025-04-01', 'เงินเดือนเข้าแล้วจ้าา8', NULL, '2025-07-10 00:11:56.097818');
INSERT INTO public.transactions VALUES ('e03a561e-2adb-4b5c-bf66-048fe405ef40', '70cf813c-50ff-4230-b9b8-be7ec22876da', '6a8dc2bf-ad0a-4066-8d08-43ae060c8f24', '760e9262-6018-48d9-ba85-75751af0cd8d', 30000.00, '2025-05-01', 'เงินเดือนเข้าแล้วจ้าา9', NULL, '2025-07-10 00:11:56.097818');
INSERT INTO public.transactions VALUES ('6091af7f-66b7-41ca-a778-ea09cad47905', '70cf813c-50ff-4230-b9b8-be7ec22876da', '6a8dc2bf-ad0a-4066-8d08-43ae060c8f24', '760e9262-6018-48d9-ba85-75751af0cd8d', 30000.00, '2025-06-01', 'เงินเดือนเข้าแล้วจ้าา10', NULL, '2025-07-10 00:11:56.097818');
INSERT INTO public.transactions VALUES ('5c16666c-1db3-4448-9393-731fa227140b', '70cf813c-50ff-4230-b9b8-be7ec22876da', '6a8dc2bf-ad0a-4066-8d08-43ae060c8f24', '760e9262-6018-48d9-ba85-75751af0cd8d', 30000.00, '2025-07-01', 'เงินเดือนเข้าแล้วจ้าา11', NULL, '2025-07-10 00:11:56.097818');


--
-- TOC entry 3400 (class 0 OID 16412)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.users VALUES ('70cf813c-50ff-4230-b9b8-be7ec22876da', 'admin', '1234');
INSERT INTO public.users VALUES ('b6f9fdb3-0868-493c-8605-e3e5be962d30', 'username', 'password');
INSERT INTO public.users VALUES ('26eb88f7-cabd-4d0d-b745-eba5299fdacb', 'hello', 'frompassword');


--
-- TOC entry 3245 (class 2606 OID 16430)
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- TOC entry 3247 (class 2606 OID 16445)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 3249 (class 2606 OID 16459)
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 3241 (class 2606 OID 16419)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3243 (class 2606 OID 16421)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 3250 (class 2606 OID 16431)
-- Name: accounts accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3251 (class 2606 OID 16446)
-- Name: categories categories_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3252 (class 2606 OID 16465)
-- Name: transactions transactions_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE SET NULL;


--
-- TOC entry 3253 (class 2606 OID 16470)
-- Name: transactions transactions_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- TOC entry 3254 (class 2606 OID 16460)
-- Name: transactions transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2025-07-10 12:22:17

--
-- PostgreSQL database dump complete
--

