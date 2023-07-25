import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Link component from react-router-dom library for creating links in React

// Defining TypeScript type for a repository
type Repo = {
  id: number;
  name: string;
  owner: {
    login: string;
  };
};

const Repos = () => {
  // Using the useState hook to create repos state variable and setRepos function to update the state
  const [repos, setRepos] = useState<Repo[]>([]);

  // Using the useEffect hook to run fetch function after component is mounted
  useEffect(() => {
    fetch('/api/repos') // Fetching data from the API endpoint
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setRepos(data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }, []); // The empty array means this effect will only run once after the component is first rendered

  return (
    <ul>
      {repos.map((repo) => (
        <li key={repo.id}>
          <Link to={`/repos/${repo.owner.login}/${repo.name}`}>{repo.name}</Link>
          {/* The Link component renders a link to the specific repo's files */}
        </li>
      ))}
    </ul>
  );
}

export default Repos;
