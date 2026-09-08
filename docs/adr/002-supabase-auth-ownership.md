# ADR-002: Supabase Auth와 소유권 정책

- 상태: 수용
- 날짜: 2026-09-08

## 결정
운영자 인증은 Supabase Auth 사전 생성 계정을 사용한다. `profiles`가 Auth 사용자와 운영자 역할을 연결하고, 관리자 리소스는 `owner_id = auth.uid()` RLS 정책으로 제한한다.

## 이유
라우트의 로그인 검사만으로는 데이터베이스·직접 API 접근을 막을 수 없다. 템플릿·캠페인·폼의 소유권을 DB 정책으로 중복 강제해야 운영자 A가 B의 데이터를 조회하거나 연결하는 경로를 줄일 수 있다.

## 운영 규칙
회원가입 API는 제공하지 않는다. Auth 사용자를 만든 뒤 `on_auth_user_created` 트리거가 프로필을 만든다. Service role 키는 브라우저나 `.env.example`에 넣지 않는다.