import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Repos from './components/Repos';
import RepoFiles from './components/RepoFiles';
import RepoFileContent from './components/RepoFileContent';

function App() {
  return (
  <>
  <h1>Github API Example</h1>
  <Router>
    <Routes>
      <Route path="/" element={<Repos />} />
      <Route path="/repos/:owner/:repo" element={<RepoFiles />} />
      <Route path="/repos/:owner/:repo/:path/*" element={<RepoFiles />} />
      <Route path="/repo/file/:owner/:repo/:path" element={<RepoFileContent />} />
    </Routes>
  </Router>
  </>
  );
}

export default App;
