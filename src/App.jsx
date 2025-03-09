import { useState } from 'react';
import TimeBasedGame from './components/game/TimeBasedGame';
import Management from './components/management/Management';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('game'); // 'game' 或 'management'

  return (
    <div className="app-container">
      <header className="app-header" style={{ textAlign: 'center', padding: '20px', borderBottom: '1px solid #eee' }}>
        <h1>籃球隊經營模擬</h1>
        
        <nav style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
          <button 
            onClick={() => setActiveTab('game')}
            style={{
              padding: '10px 20px',
              margin: '0 10px',
              fontSize: '16px',
              backgroundColor: activeTab === 'game' ? '#e74c3c' : '#f1f1f1',
              color: activeTab === 'game' ? 'white' : 'black',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            即時制比賽
          </button>
          <button 
            onClick={() => setActiveTab('management')}
            style={{
              padding: '10px 20px',
              margin: '0 10px',
              fontSize: '16px',
              backgroundColor: activeTab === 'management' ? '#3498db' : '#f1f1f1',
              color: activeTab === 'management' ? 'white' : 'black',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            球隊經營
          </button>
        </nav>
      </header>
      
      <main style={{ padding: '20px' }}>
        {activeTab === 'game' && <TimeBasedGame />}
        {activeTab === 'management' && <Management />}
      </main>
      
      <footer style={{ textAlign: 'center', padding: '20px', color: '#666', borderTop: '1px solid #eee', marginTop: '20px' }}>
        <p>籃球隊經營模擬遊戲 &copy; 2025</p>
      </footer>
    </div>
  );
}

export default App;