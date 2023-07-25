import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const RepoFileContent = () => {
  const { owner, repo, path } = useParams();
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [sha, setSha] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // base64encode
  const encodedPath = btoa(path!);

  useEffect(() => {
    fetch(`/api/repos/${owner}/${repo}/${encodedPath}`)
      .then(response => response.json())
      .then(data => {
        const decodedContent = atob(data.content)
        setContent(decodedContent)
        setOriginalContent(decodedContent)
        setSha(data.sha)
      })
      .catch(err => console.error(err));
  }, [owner, repo, encodedPath]);

  const handleContentClick = () => {
    setIsEditing(true);
  };

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
    console.log('handleContentChange');
  };

  const handleBlur = () => {
    setIsEditing(false);
    console.log('handleBlur');
  };

  const handleCancel = () => {
    console.log('handleCancel');
    setContent(originalContent);
    setIsEditing(false);
  };

  const handleSave = async () => {
    console.log('handleSave');

    const now = new Date();
    const timestamp =
      now.getFullYear() +
      '' +
      (now.getMonth() + 1) +
      '' +
      now.getDate() +
      '' +
      now.getHours() +
      '' +
      now.getMinutes() +
      '' +
      now.getSeconds();

    await fetch('/api/file/save/branch/pr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        owner: owner,
        repo: repo,
        path: path,
        content: content,
        newBranch: `created-by-github-api-${timestamp}`,
        commitMessage: `commit-by-github-api-${timestamp}`,
        pullRequestTitle: `pr-created-by-github-api-${timestamp}`,
      }),
    });
  
    setIsEditing(false);
  };  

  return isEditing ? (
    <>
    <textarea value={content} onChange={handleContentChange} onBlur={handleBlur} autoFocus />
    <div>
      <button onMouseDown={handleSave}>Save to New Branch and Request PR</button>
      <button onMouseDown={handleCancel}>Cancel</button>
      {/* When you click the mouse, the browser processes events in the following order：onMouseDown -> onBlur -> onMouseUp -> onClick */}
    </div>
    </>
  ) : (
    <pre onClick={handleContentClick}>{content}</pre>
  );
};

export default RepoFileContent;
