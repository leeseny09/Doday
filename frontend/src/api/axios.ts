import axios from 'axios';

// axios 인스턴스 생성
// 모든 api 요청에 공통으로 적용되는 기본 설정
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
});

// 요청 인터셉터 - 모든 요청에 토큰 자동 추가
// 모든 api 요청이 나가기 전에 자동으로 실행됨
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    // localstorage -> 브라우저에 데이터를 저장하는 공간, 로그인 할 때 저장한 토큰 꺼내옴
    if (token) {  // 토큰이 있으면
        // 모든 요청 헤더에 자동으로 추가
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 응답 인터셉터
// 모든 api 응답을 받은 후 자동으로 실행됨
api.interceptors.response.use(
    (response) => response, // 성공 응답은 그대로 반환

    // 401 -> 인증 실패 에러 access 토큰 만료 또는 유효하지 않을 때 발생
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('accessToken');
            // 401이면 만료된 토큰 삭제
            window.location.href = '/';
            // 로그인 페이지로 강제 이동 ( 자동 로그아웃 )
        }
        return Promise.reject(error);
        // 에러를 그대로 반환해서 각 api 호출 측에서도 처리 가능하게
    }
);

export default api;
// 다른 파일에서 이 설정을 가져다 쓸 수 있게 axios.ts에서 만든 api 객체를 내보내기 하는 거
// 임포트 해서 사용할 수 있음