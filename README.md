
# SQL Assistant

**SQL Assistant**는 자연어로 데이터베이스를 질의하고, 이를 자동으로 SQL로 번역하여 사용할 수 있도록 돕는 AI 기반 도구입니다. OpenAI의 GPT 모델을 활용해 최적의 SQL문을 생성하고 설명까지 제공함으로써 SQL 지식이 부족한 사용자도 쉽게 DB를 탐색할 수 있습니다.

## 🔍 주요 기능

- **자연어 → SQL 변환**: 평범한 문장으로 질의하면 SQL문을 생성하고, 분석까지 자세히 설명해줍니다.
- **다중 DB 방언 지원**: MySQL, PostgreSQL 등 다양한 DBMS에 맞는 SQL을 생성하거나 기존 SQL을 다른 방언으로 변환할 수 있습니다.
- **채팅형 UI**: 질문을 던지고 답을 수정하는 인터랙티브 대화 인터페이스로 SQL 전문가와 대화하듯 작업할 수 있습니다.
- **SQL 설명 기능**: 입력된 SQL을 자연어로 설명하고, 쿼리 구조와 성능 관점에서 분석해줍니다.
- **쿼리 이력 & 즐겨찾기**: 사용 이력을 자동 저장하고, 자주 쓰는 쿼리는 즐겨찾기할 수 있습니다.
- **쿼리 공유 기능**: 생성된 쿼리 결과와 설명을 외부에 링크 형태로 공유할 수 있으며, 만료일을 지정할 수도 있습니다.
- **데이터 시각화 지원**: Chart.js 기반 시각화 기능으로 결과를 차트 형태로 확인할 수 있습니다.
- **스키마 관리**: DB 스키마 정보를 등록하여, 더 정확한 SQL 생성을 도울 수 있습니다.
- **REST API 제공**: 내부 로직을 API로도 노출해, 외부 애플리케이션에서도 자연어 기반 SQL 생성 기능을 활용할 수 있습니다.

## ⚙ 설치 및 설정

### 사전 준비

- Node.js 18 이상 및 npm 설치  
- OpenAI API 키  
- PostgreSQL 인스턴스 (데이터 저장 또는 세션 관리 용도)

### 설치

```bash
git clone https://github.com/KCRUISE/SQLAssistant.git
cd SQLAssistant
npm install
```

### 환경변수 설정

루트 디렉토리에 `.env` 파일을 생성하고 아래 내용을 입력하세요:

```
OPENAI_API_KEY=<your_openai_api_key>
DATABASE_URL=postgres://user:pass@localhost:5432/mydb
SESSION_SECRET=<optional_secret>
```

### DB 초기화

```bash
npm run db:push
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:5000](http://localhost:5000) 접속

### 배포용 실행

```bash
npm run build
npm start
```

---

## 🚀 사용 방법

1. 웹 UI 접속 후 자연어 입력  
2. SQL 생성, 변환, 설명 기능 이용 가능  
3. 생성된 쿼리는 DB에 직접 실행하거나, 결과를 시각화 도구로 확인  
4. 쿼리를 즐겨찾거나 공유 링크 생성도 가능  
5. REST API(`POST /api/sql/generate` 등)를 통해 외부에서 자연어 기반 SQL 생성 기능 호출 가능

---

## 💡 예시

| 자연어 질의 | 생성된 SQL |
|------------|------------|
| 지난 7일간 가입자 수 | `SELECT COUNT(*) FROM users WHERE signup_date >= CURRENT_DATE - INTERVAL '7 days';` |
| 2023년 상품별 매출 순위 TOP5 | `SELECT product_name, SUM(sales_amount) AS total_sales FROM orders WHERE YEAR(order_date)=2023 GROUP BY product_name ORDER BY total_sales DESC LIMIT 5;` |
| 부서별 평균 급여 | `SELECT department, AVG(salary) AS average_salary FROM employees GROUP BY department;` |

---

## 🗂 폴더 구조

```
/
├── client/              # React 프런트엔드 (Vite 기반)
├── server/              # Express 백엔드 및 API
├── shared/              # Frontend / Backend 공용 타입 정의 및 스키마
├── migrations/          # Drizzle ORM 마이그레이션 파일
├── attached_assets/     # 정적 자원
├── package.json         # 프로젝트 메타데이터 및 스크립트
├── tsconfig.json 등     # 타입스크립트 및 빌드 설정 파일
```

---

## 🤝 기여

1. Issue 작성 또는 Discussion 시작  
2. Fork → 브랜치 생성 → 수정 → PR 제출  
3. PR 제출 전에 `npm run check` (타입 검사 및 lint) 실행 권장  
4. 변경 시 테스트 추가 권장

---

## 📄 라이선스

본 프로젝트는 **MIT License** 하에 배포됩니다. 자유롭게 사용, 수정, 배포 가능하며 자세한 사항은 [LICENSE](./LICENSE) 파일을 참고하세요.
