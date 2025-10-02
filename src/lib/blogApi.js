import { useEffect, useState } from "react";
import data from "content/blog/posts.json";


export function useBlogPosts() {
    const [posts, setPosts] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
// 초기엔 정적 JSON 사용
        try {
// 날짜 내림차순
            const sorted = [...data.posts].sort((a, b) => new Date(b.date) - new Date(a.date));
            setPosts(sorted);
        } catch (e) {
            setError(e);
        } finally {
            setIsLoading(false);
        }
    }, []);


    return { posts, isLoading, error };
}


// 추후 서버 API로 전환 시 예시
// export function useBlogPosts() {
// const { data, error, isLoading } = useSWR('/blog/posts', fetcher)
// return { posts: data?.posts ?? [], isLoading, error }
// }