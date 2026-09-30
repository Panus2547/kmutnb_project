--
-- PostgreSQL database dump
--



-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-09-30 09:38:29

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
-- TOC entry 231 (class 1255 OID 16409)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 230 (class 1259 OID 16471)
-- Name: budget; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.budget (
    budget_id bigint NOT NULL,
    plan_id bigint NOT NULL,
    budget_source character varying NOT NULL,
    allocated_amount numeric(15,2) DEFAULT 0,
    actual_amount numeric(15,2) DEFAULT 0
);


--
-- TOC entry 5069 (class 0 OID 0)
-- Dependencies: 230
-- Name: COLUMN budget.plan_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.budget.plan_id IS 'ดึง plan_id มาเพื่อให้รู้ว่าเป็นงบของแผนงานไหน';


--
-- TOC entry 5070 (class 0 OID 0)
-- Dependencies: 230
-- Name: COLUMN budget.budget_source; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.budget.budget_source IS 'แหล่งงบประมาณจากที่ไหน';


--
-- TOC entry 5071 (class 0 OID 0)
-- Dependencies: 230
-- Name: COLUMN budget.allocated_amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.budget.allocated_amount IS 'งบที่ตั้งไว้สำหรับแผนงานนี้';


--
-- TOC entry 5072 (class 0 OID 0)
-- Dependencies: 230
-- Name: COLUMN budget.actual_amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.budget.actual_amount IS 'งบที่ใช้จริง';


--
-- TOC entry 219 (class 1259 OID 16385)
-- Name: budget_budget_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.budget_budget_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 229 (class 1259 OID 16470)
-- Name: budget_budget_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.budget ALTER COLUMN budget_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.budget_budget_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 226 (class 1259 OID 16432)
-- Name: plan; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plan (
    plan_id bigint NOT NULL,
    plan_name character varying(255) NOT NULL,
    status character varying NOT NULL,
    performance text,
    issues text,
    start_at date,
    end_at date,
    created_by bigint,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 5073 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN plan.plan_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.plan.plan_name IS 'ชื่อแผนงาน';


--
-- TOC entry 5074 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN plan.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.plan.status IS 'สถานะโตรงการว่าดำเนินการไปถึงขั้นไหนแล้ว';


--
-- TOC entry 5075 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN plan.performance; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.plan.performance IS 'รายละเอียดผลงานเชิงคุณภาพ';


--
-- TOC entry 5076 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN plan.issues; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.plan.issues IS 'ปัญหาที่เกิดขึ้น';


--
-- TOC entry 5077 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN plan.start_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.plan.start_at IS 'เริ่มแผนงาน';


--
-- TOC entry 5078 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN plan.end_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.plan.end_at IS 'สิ้นสุดแผนงาน';


--
-- TOC entry 5079 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN plan.created_by; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.plan.created_by IS 'ผู้รับผิดชอบ';


--
-- TOC entry 228 (class 1259 OID 16453)
-- Name: plan_kpi; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plan_kpi (
    kpi_id bigint NOT NULL,
    plan_id bigint NOT NULL,
    kpi text NOT NULL,
    unit character varying(50),
    target numeric(15,2),
    results numeric(15,2),
    process boolean DEFAULT false NOT NULL
);


--
-- TOC entry 5080 (class 0 OID 0)
-- Dependencies: 228
-- Name: COLUMN plan_kpi.plan_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.plan_kpi.plan_id IS 'เชื่อมกับ plan_id เพื่อจะได้รู้ว่าเป็นตัวชี้วัดของแผนงานไหน';


--
-- TOC entry 5081 (class 0 OID 0)
-- Dependencies: 228
-- Name: COLUMN plan_kpi.kpi; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.plan_kpi.kpi IS 'ตัวชี้วัด';


--
-- TOC entry 5082 (class 0 OID 0)
-- Dependencies: 228
-- Name: COLUMN plan_kpi.unit; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.plan_kpi.unit IS 'หน่วยนับตัวชี้วัด';


--
-- TOC entry 5083 (class 0 OID 0)
-- Dependencies: 228
-- Name: COLUMN plan_kpi.target; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.plan_kpi.target IS 'เป้าหมายที่กำหนด';


--
-- TOC entry 5084 (class 0 OID 0)
-- Dependencies: 228
-- Name: COLUMN plan_kpi.results; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.plan_kpi.results IS 'จำนวนที่ทำได้จริง';


--
-- TOC entry 5085 (class 0 OID 0)
-- Dependencies: 228
-- Name: COLUMN plan_kpi.process; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.plan_kpi.process IS 'ตัวชี้วีดนี้สำเร็จมั้ย';


--
-- TOC entry 220 (class 1259 OID 16386)
-- Name: plan_kpi_kpi_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.plan_kpi_kpi_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 227 (class 1259 OID 16452)
-- Name: plan_kpi_kpi_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.plan_kpi ALTER COLUMN kpi_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.plan_kpi_kpi_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 221 (class 1259 OID 16387)
-- Name: plan_plan_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.plan_plan_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 225 (class 1259 OID 16431)
-- Name: plan_plan_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.plan ALTER COLUMN plan_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.plan_plan_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 224 (class 1259 OID 16411)
-- Name: user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."user" (
    user_id bigint NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    phone character varying(20) NOT NULL,
    role character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    reset_token character varying(255),
    reset_token_expires timestamp without time zone
);


--
-- TOC entry 5086 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN "user".username; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."user".username IS 'ชื่อผู้ใช้';


--
-- TOC entry 5087 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN "user".email; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."user".email IS 'อีเมล';


--
-- TOC entry 5088 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN "user".password; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."user".password IS 'รหัสผ่าน';


--
-- TOC entry 5089 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN "user".phone; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."user".phone IS 'เบอร์โทร';


--
-- TOC entry 5090 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN "user".role; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."user".role IS 'ตำแหน่ง';


--
-- TOC entry 222 (class 1259 OID 16388)
-- Name: user_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 223 (class 1259 OID 16410)
-- Name: user_user_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."user" ALTER COLUMN user_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.user_user_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 5063 (class 0 OID 16471)
-- Dependencies: 230
-- Data for Name: budget; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.budget OVERRIDING SYSTEM VALUE VALUES (7, 9, 'งปม.เงินรายได้', 435000.00, 316427.10);
INSERT INTO public.budget OVERRIDING SYSTEM VALUE VALUES (15, 17, 'เงินบริจาค/อุดหนุน', 100.00, 100.00);
INSERT INTO public.budget OVERRIDING SYSTEM VALUE VALUES (17, 19, 'เงินภาษี', 100.00, 100.00);
INSERT INTO public.budget OVERRIDING SYSTEM VALUE VALUES (18, 20, 'ตาปึกให้มา', 200.00, 300.00);
INSERT INTO public.budget OVERRIDING SYSTEM VALUE VALUES (19, 21, 'งปม.เงินรายได้', 100.00, 100.00);
INSERT INTO public.budget OVERRIDING SYSTEM VALUE VALUES (20, 22, 'งปม.แผ่นดิน', 100.00, 100.00);
INSERT INTO public.budget OVERRIDING SYSTEM VALUE VALUES (21, 23, 'งปม.เงินรายได้', 200.00, 200.00);
INSERT INTO public.budget OVERRIDING SYSTEM VALUE VALUES (22, 27, 'งปม.เงินรายได้', 400.00, 400.00);
INSERT INTO public.budget OVERRIDING SYSTEM VALUE VALUES (23, 28, 'งปม.เงินรายได้', 500.00, 500.00);
INSERT INTO public.budget OVERRIDING SYSTEM VALUE VALUES (24, 29, 'งปม.เงินรายได้', 100.00, 411.00);
INSERT INTO public.budget OVERRIDING SYSTEM VALUE VALUES (8, 10, 'งปม.เงินรายได้', 300000.00, 200.00);


--
-- TOC entry 5059 (class 0 OID 16432)
-- Dependencies: 226
-- Data for Name: plan; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.plan OVERRIDING SYSTEM VALUE VALUES (17, 'oooooo', 'กำลังดำเนินงาน', 'uuuu', 'yyy', '2026-08-02', '2026-08-01', 1, '2026-09-14 22:38:12.293478+07', '2026-09-17 13:11:12.578857+07');
INSERT INTO public.plan OVERRIDING SYSTEM VALUE VALUES (19, 'opopop[[', 'กำลังดำเนินงาน', 'นๆาอเหอเด่ร', 'ไเดฟไเดฟไดำ', '2026-08-29', '2026-09-08', 1, '2026-09-17 09:36:12.233927+07', '2026-09-17 15:14:35.666807+07');
INSERT INTO public.plan OVERRIDING SYSTEM VALUE VALUES (21, 'พพพพ', 'กำลังดำเนินงาน', '', '', '2026-09-02', '2026-08-31', 1, '2026-09-17 15:26:23.021836+07', '2026-09-17 15:26:23.021836+07');
INSERT INTO public.plan OVERRIDING SYSTEM VALUE VALUES (22, 'qqqq', 'กำลังดำเนินงาน', '', '', '2026-09-10', '2026-09-01', 1, '2026-09-17 15:35:19.313146+07', '2026-09-17 15:35:19.313146+07');
INSERT INTO public.plan OVERRIDING SYSTEM VALUE VALUES (23, 'yyyy', 'อยู่ระหว่างดำเนินการ', '', '', '2026-09-03', '2026-09-14', 1, '2026-09-17 15:35:44.455138+07', '2026-09-17 15:35:44.455138+07');
INSERT INTO public.plan OVERRIDING SYSTEM VALUE VALUES (27, 'aaas', 'กำลังดำเนินงาน', '', '', '2026-09-04', '2026-09-08', 1, '2026-09-17 15:36:57.85114+07', '2026-09-17 15:36:57.85114+07');
INSERT INTO public.plan OVERRIDING SYSTEM VALUE VALUES (28, 'tyyy', 'กำลังดำเนินงาน', '', '', '2026-09-03', '2026-09-07', 1, '2026-09-17 15:37:21.576593+07', '2026-09-17 15:37:21.576593+07');
INSERT INTO public.plan OVERRIDING SYSTEM VALUE VALUES (9, 'โครงการบูรณาการเรียนการสอนผ่านการปฏิบัติงานจริง', 'กำลังดำเนินงาน', '', '', '2024-09-25', '2025-08-26', 2, '2026-09-11 09:49:28.919926+07', '2026-09-25 10:42:29.482567+07');
INSERT INTO public.plan OVERRIDING SYSTEM VALUE VALUES (20, 'การงานอาชีพ', 'ขอเลื่อนดำเนินการ', 'pppp', '', '2026-08-31', '2026-09-08', 7, '2026-09-17 15:16:50.088185+07', '2026-09-24 14:34:44.750584+07');
INSERT INTO public.plan OVERRIDING SYSTEM VALUE VALUES (29, 'rttt', 'อยู่ระหว่างดำเนินการ', 'อิอออออ', '', '2026-09-07', '2026-08-23', 1, '2026-09-17 15:37:50.915597+07', '2026-09-25 11:30:23.86436+07');
INSERT INTO public.plan OVERRIDING SYSTEM VALUE VALUES (10, 'การบ้าน', 'ยกเลิก', 'yyyyyyyyyyyyyyy', '', '2024-10-28', '2025-05-22', 3, '2026-09-11 09:54:54.919214+07', '2026-09-27 14:30:42.64198+07');


--
-- TOC entry 5061 (class 0 OID 16453)
-- Dependencies: 228
-- Data for Name: plan_kpi; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.plan_kpi OVERRIDING SYSTEM VALUE VALUES (83, 9, 'fbg', 'hnhn', 9.00, 7.00, true);
INSERT INTO public.plan_kpi OVERRIDING SYSTEM VALUE VALUES (91, 29, 'pp', 'op', 3027.00, 6.00, true);
INSERT INTO public.plan_kpi OVERRIDING SYSTEM VALUE VALUES (92, 29, 'ssss', 's', 30.00, 1.00, true);
INSERT INTO public.plan_kpi OVERRIDING SYSTEM VALUE VALUES (94, 10, 'คะแนนเฉลี่ย', 'คะแนนเฉลี่ย', 4.00, 5.00, true);
INSERT INTO public.plan_kpi OVERRIDING SYSTEM VALUE VALUES (26, 17, 'sdgsadgs', 'sfd', 11.00, 111.00, true);
INSERT INTO public.plan_kpi OVERRIDING SYSTEM VALUE VALUES (32, 19, 'fff', 'tt', 1.00, 1.00, true);
INSERT INTO public.plan_kpi OVERRIDING SYSTEM VALUE VALUES (33, 19, 'ooo', 'uu', 1.00, 1.00, true);
INSERT INTO public.plan_kpi OVERRIDING SYSTEM VALUE VALUES (34, 19, 'uu', 'i', 1.00, 1.00, true);
INSERT INTO public.plan_kpi OVERRIDING SYSTEM VALUE VALUES (35, 19, 'pop', 'p', 5.00, 7.00, true);
INSERT INTO public.plan_kpi OVERRIDING SYSTEM VALUE VALUES (37, 21, 'พพ', 'พ', 1.00, 1.00, true);
INSERT INTO public.plan_kpi OVERRIDING SYSTEM VALUE VALUES (38, 21, 'ee', 'r', 1.00, 1.00, true);
INSERT INTO public.plan_kpi OVERRIDING SYSTEM VALUE VALUES (39, 22, 'rgf', 'yy', 1.00, 1.00, true);
INSERT INTO public.plan_kpi OVERRIDING SYSTEM VALUE VALUES (40, 23, 'gggg', 'g', 1.00, 1.00, true);
INSERT INTO public.plan_kpi OVERRIDING SYSTEM VALUE VALUES (41, 23, 'aqawa', 't', 2.00, 2.00, true);
INSERT INTO public.plan_kpi OVERRIDING SYSTEM VALUE VALUES (42, 27, 'pp', 'p', 1.00, 1.00, true);
INSERT INTO public.plan_kpi OVERRIDING SYSTEM VALUE VALUES (43, 28, 'tr', 't', 1.00, 1.00, true);
INSERT INTO public.plan_kpi OVERRIDING SYSTEM VALUE VALUES (55, 20, 'จร', 'นย', 4.00, 7.00, true);


--
-- TOC entry 5057 (class 0 OID 16411)
-- Dependencies: 224
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."user" OVERRIDING SYSTEM VALUE VALUES (1, 'admin', 'admin@gmail.com', '$2b$10$5VD3sOUS6ZlVZLC19u/bUO28HPuaMcZDpNFz7OKQsX3Lm6uNHBShC', '0812345678', 'admin', '2026-08-30 00:43:32.813037+07', '2026-08-30 00:43:32.813037+07', NULL, NULL);
INSERT INTO public."user" OVERRIDING SYSTEM VALUE VALUES (2, 'Peter_Parker', 'peter@gmail.com', '$2b$10$BoQAVs3RrzgajLHtUIlPrOjr8EfpUuv36ek1Y4fAPtV3ny9hRZFza', '0823456789', 'รองคณบดีฝ่ายวิชาการและมาตรฐานวิชาชีพ', '2026-08-31 09:16:03.631298+07', '2026-08-31 09:16:03.631298+07', NULL, NULL);
INSERT INTO public."user" OVERRIDING SYSTEM VALUE VALUES (4, 'Coca_Cola', 'coca@gmail.com', '$2b$10$hLJrK0SuraQgfSWT8YIyAuVBNFJ1md5LmhiOFHjsQ2ba8flCEaNCi', '0834567890', 'ภาควิชาครุศาสตร์โยธา', '2026-09-07 13:34:03.586038+07', '2026-09-07 13:34:03.586038+07', NULL, NULL);
INSERT INTO public."user" OVERRIDING SYSTEM VALUE VALUES (3, 'Piggy_Pig', 'piggy@gmail.com', '$2b$10$43Om77WWGJNbsyvfaPDNRO2NYRVX2fySv5KbVyzHuBIAKo8ZLSVdK', '0834567890', 'ภาควิชาครุศาสตร์เครื่องกล', '2026-08-31 10:21:54.41103+07', '2026-09-27 23:03:38.464943+07', NULL, NULL);
INSERT INTO public."user" OVERRIDING SYSTEM VALUE VALUES (8, 'pJasusi', 'panusonnom@gmail.com', '$2b$10$qKb/s1NnvSMW62FYX2TWyelX3hkYU7XG.9GdApWzUCQOVTjeSMGKS', '0826158319', 'admin', '2026-09-28 00:04:51.186309+07', '2026-09-28 00:26:48.303625+07', NULL, NULL);
INSERT INTO public."user" OVERRIDING SYSTEM VALUE VALUES (7, 'Peepo_Deanman', 'peepo@gmail.com', '$2b$10$yGKR6c7tRxaI.1oizE8ZtuggIzC30k7kgkme07.EKuoHB2Q2S/Xb2', '0000000000', 'ภาควิชาครุศาสตร์ไฟฟ้า', '2026-09-10 10:52:20.762005+07', '2026-09-29 11:57:54.963598+07', NULL, NULL);


--
-- TOC entry 5091 (class 0 OID 0)
-- Dependencies: 219
-- Name: budget_budget_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.budget_budget_id_seq', 1, false);


--
-- TOC entry 5092 (class 0 OID 0)
-- Dependencies: 229
-- Name: budget_budget_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.budget_budget_id_seq1', 24, true);


--
-- TOC entry 5093 (class 0 OID 0)
-- Dependencies: 220
-- Name: plan_kpi_kpi_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.plan_kpi_kpi_id_seq', 1, false);


--
-- TOC entry 5094 (class 0 OID 0)
-- Dependencies: 227
-- Name: plan_kpi_kpi_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.plan_kpi_kpi_id_seq1', 94, true);


--
-- TOC entry 5095 (class 0 OID 0)
-- Dependencies: 221
-- Name: plan_plan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.plan_plan_id_seq', 1, false);


--
-- TOC entry 5096 (class 0 OID 0)
-- Dependencies: 225
-- Name: plan_plan_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.plan_plan_id_seq1', 29, true);


--
-- TOC entry 5097 (class 0 OID 0)
-- Dependencies: 222
-- Name: user_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_user_id_seq', 1, false);


--
-- TOC entry 5098 (class 0 OID 0)
-- Dependencies: 223
-- Name: user_user_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_user_id_seq1', 8, true);


--
-- TOC entry 4896 (class 2606 OID 16482)
-- Name: budget budget_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget
    ADD CONSTRAINT budget_pkey PRIMARY KEY (budget_id);


--
-- TOC entry 4894 (class 2606 OID 16464)
-- Name: plan_kpi plan_kpi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_kpi
    ADD CONSTRAINT plan_kpi_pkey PRIMARY KEY (kpi_id);


--
-- TOC entry 4890 (class 2606 OID 16443)
-- Name: plan plan_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan
    ADD CONSTRAINT plan_pkey PRIMARY KEY (plan_id);


--
-- TOC entry 4892 (class 2606 OID 16445)
-- Name: plan plan_plan_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan
    ADD CONSTRAINT plan_plan_name_key UNIQUE (plan_name);


--
-- TOC entry 4899 (class 2606 OID 16484)
-- Name: budget unique_plan_budget_source; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget
    ADD CONSTRAINT unique_plan_budget_source UNIQUE (plan_id, budget_source);


--
-- TOC entry 4884 (class 2606 OID 16427)
-- Name: user user_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- TOC entry 4886 (class 2606 OID 16425)
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4888 (class 2606 OID 16429)
-- Name: user user_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_username_key UNIQUE (username);


--
-- TOC entry 4897 (class 1259 OID 16490)
-- Name: idx_budget_plan; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_budget_plan ON public.budget USING btree (plan_id);


--
-- TOC entry 4904 (class 2620 OID 16451)
-- Name: plan update_plan_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_plan_updated_at BEFORE UPDATE ON public.plan FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4903 (class 2620 OID 16430)
-- Name: user update_user_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON public."user" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4902 (class 2606 OID 16485)
-- Name: budget budget_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget
    ADD CONSTRAINT budget_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plan(plan_id) ON DELETE CASCADE;


--
-- TOC entry 4901 (class 2606 OID 16465)
-- Name: plan_kpi plan_kpi_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_kpi
    ADD CONSTRAINT plan_kpi_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plan(plan_id) ON DELETE CASCADE;


--
-- TOC entry 4900 (class 2606 OID 16446)
-- Name: plan plan_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan
    ADD CONSTRAINT plan_user_id_fkey FOREIGN KEY (created_by) REFERENCES public."user"(user_id) ON DELETE SET NULL;


-- Completed on 2026-09-30 09:38:29

--
-- PostgreSQL database dump complete
--


