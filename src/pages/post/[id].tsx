import NextError from 'next/error';
import { useRouter } from 'next/router';
import { NextPageWithLayout } from '~/pages/_app';
import { trpc } from '~/utils/trpc';

const PostViewPage: NextPageWithLayout = () => {
  const id = useRouter().query.id as string;
  const utils = trpc.useContext();
  const postQuery = trpc.useQuery(['post.byId', { id }]);
  // TODO load comments for this post
  const commentsQuery = trpc.useQuery(['comments.byPostId', { id }]);
  const addComment = trpc.useMutation('comments.add', {
    async onSuccess() {
      // refetches comments after a comment is added
      await utils.invalidateQueries(['comments.byPostId', { id }]);
    },
  });

  if (postQuery.error) {
    return (
      <NextError
        title={postQuery.error.message}
        statusCode={postQuery.error.data?.httpStatus ?? 500}
      />
    );
  }

  if (postQuery.status !== 'success') {
    return <>Loading...</>;
  }
  const { data } = postQuery;

  return (
    <>
      <h1>{data.title}</h1>
      <em>Created {data.createdAt.toLocaleDateString()}</em>

      <p>{data.text}</p>

      <h2>Raw data:</h2>
      <pre>{JSON.stringify(data, null, 4)}</pre>

      <h3>Comments for This Post</h3>
      <ul>
        {commentsQuery.data?.map((comment) => (
          <li key={comment.id}>
            <p>{comment.name} says:</p>
            <p>{comment.text}</p>
            <p>Post on {comment.createdAt.toISOString()}</p>
          </li>
        ))}
      </ul>
      <h3>Add a Comment</h3>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const $name: HTMLInputElement = (event as any).target.elements.name;
          const $comment: HTMLInputElement = (event as any).target.elements
            .comment;
          const input = {
            name: $name.value,
            text: $comment.value,
            postId: id,
          };

          addComment.mutate(input);

          $name.value = '';
          $comment.value = '';
        }}
      >
        <label htmlFor="name">Name</label>
        <br />
        <input id="name" type="text" name="name" />
        <br />
        <br />
        <label htmlFor="comment">Comment</label>
        <br />
        <textarea id="comment" name="comment"></textarea>
        <br />
        <input type="hidden" name="postId" value={id} />
        <br />
        <button type="submit">Add Comment</button>
      </form>
    </>
  );
};

export default PostViewPage;
