import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

type RepoFile = {
  name: string;
  path: string;
  size: number;
  type: string; // add type
};

const RepoFiles = () => {
  const { owner, repo, path = '' } = useParams(); // add path
  const [files, setFiles] = useState<RepoFile[]>([]);

  useEffect(() => {
    fetch(`/api/repos/${owner}/${repo}/${btoa(path)}`) // add btoa to encode path
      .then(response => response.json())
      .then(data => setFiles(data))
      .catch(err => console.error(err));
  }, [owner, repo, path]); // Dependence array includes "owner", "repo" and "path", which means useEffect will run again if either of them changes.

  return (
    <ul>
      {Array.isArray(files) && files.map((file) => (
        <li key={file.path}>
          {file.type === 'dir' ? (
            <Link to={`/repos/${owner}/${repo}/${encodeURIComponent(file.path)}`}>{file.name}</Link> // change route for directory
          ) : (
            <Link to={`/repo/file/${owner}/${repo}/${encodeURIComponent(file.path)}`}>{file.name}</Link> // remain unchanged for file
          )}
        </li>
      ))}
    </ul>
  );
};

export default RepoFiles;
