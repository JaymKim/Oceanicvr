import React, { useState } from 'react';

function Community({ user }) {
  const [posts, setPosts] = useState([
    { id: 1, title: 'Welcome to Oceanic VR Community!', content: 'Feel free to share your diving stories here.', author: '🌊 Admin' },
    { id: 2, title: 'Best dive spots in Asia?', content: "Let's discuss your favorite places to dive!", author: '🐬 GuestUser' },
  ]);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handlePost = (e) => {
    e.preventDefault();
    if (!title || !content) return;
    const newPost = {
      id: posts.length + 1,
      title,
      content,
      author: user?.displayName || 'Anonymous'
    };
    setPosts([newPost, ...posts]);
    setTitle('');
    setContent('');
  };

  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <h2 className="text-3xl font-bold text-center text-sky-600 mb-8">Community</h2>

      {user && (
        <form onSubmit={handlePost} className="bg-white p-6 rounded-lg shadow mb-10 space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
          <textarea
            placeholder="Share your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-sky-400"
          ></textarea>
          <button
            type="submit"
            className="bg-sky-500 text-white px-6 py-2 rounded hover:bg-sky-600"
          >
            Post
          </button>
        </form>
      )}

      <div className="space-y-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-sky-700 mb-2">{post.title}</h3>
            <p className="text-gray-700 mb-2">{post.content}</p>
            <p className="text-sm text-gray-500">Posted by: <span className="font-medium">{post.author}</span></p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Community;