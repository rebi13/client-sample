import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import useCustomMutation from '../../../hooks/useCustomMutation';
import axiosRequest from '../../../api';
import { Board, res } from '../../../@types';

export default function Post() {
  const { id } = useParams();
  //input form 참조
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const {
    isLoading,
    isError,
    error,
    data: board
  } = useQuery({
    queryKey: ['getBoardForUpdate', id],
    queryFn: () =>
      id
        ? axiosRequest.requestAxios<res<Board>>('get', `/boards/${id}`)
        : undefined,
    enabled: !!id // id 존재할 경우에만 수행
  });

  const key = ['posts']; // Key 값 설정
  const info = {
    method: id ? 'patch' : 'post',
    url: id ? `/boards/${id}` : '/boards',
    data: { title: titleRef, content: contentRef }
  };

  const CustomMutation = useCustomMutation<res<Board>>(key, info);

  const mutation = CustomMutation();

  // const mutation = useCustomMutation<res<Board>>(key, info);

  // id가 변경될 때마다 데이터를 가져와서 titleRef와 contentRef에 할당합니다.
  useEffect(() => {
    if (id && titleRef.current && contentRef.current && board) {
      titleRef.current.value = board.data.title;
      contentRef.current.value = board.data.content;
    }
  }, [id, board]);

  // 수정 api 호출하는거 처리하고 그담에 react query custom hook으로 만들기 공통으로
  // 조건부 렌더링을 수행합니다.
  if (id) {
    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (isError) {
      return <h2>{'An error has occurred: ' + error}</h2>;
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 제목, 내용 유효성 검사
    const title = titleRef.current?.value || '';
    const content = contentRef.current?.value || '';
    mutation.mutate();
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <input type="text" placeholder="제목" ref={titleRef} />
        </div>
        <div>
          <textarea placeholder="내용" ref={contentRef} />
        </div>
        <button type="submit" disabled={mutation.isLoading}>
          {id ? '수정' : '등록'}
          {mutation.isLoading ? 'Creating...' : 'Create Post'}
        </button>
      </form>
    </>
  );
}
