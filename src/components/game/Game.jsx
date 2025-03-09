import { useState, useEffect, useRef } from 'react';
import GameRound from './GameRound';
import CriticalMoment from './CriticalMoment';
import {
  loadPlayers,
  loadSkills,
  loadOpponents,
  calculateTeamAttack,
  calculateTeamDefense,
  simulateFirstThreeQuarters
} from '../../utils/dataLoader';

/**
 * 比賽主組件
 * 負責控制整個比賽流程，包括前三節模擬、第四節的三個回合、關鍵時刻和最終結果
 */
const Game = () => {
  // 遊戲數據
  const [players, setPlayers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [opponents, setOpponents] = useState([]);
  const [opponent, setOpponent] = useState(null);
  
  // 遊戲狀態
  const [gameState, setGameState] = useState('loading'); // loading, intro, playing, critical, result
  const [currentRound, setCurrentRound] = useState(0);
  const [usedSkills, setUsedSkills] = useState([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5分鐘遊戲時間
  const timeIntervalRef = useRef(null);
  
  // 比分
  const [teamScore, setTeamScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  
  // 遊戲紀錄
  const [gameLog, setGameLog] = useState([]);
  
  // 載入遊戲數據
  useEffect(() => {
    const loadGameData = async () => {
      try {
        // 載入數據
        const playersData = await loadPlayers();
        const skillsData = await loadSkills();
        const opponentsData = await loadOpponents();
        
        setPlayers(playersData);
        setSkills(skillsData);
        setOpponents(opponentsData);
        
        // 隨機選擇對手
        const randomOpponent = opponentsData[Math.floor(Math.random() * opponentsData.length)];
        setOpponent(randomOpponent);
        
        // 模擬前三節
        const teamAttack = calculateTeamAttack(playersData);
        const teamDefense = calculateTeamDefense(playersData);
        
        const firstThreeQuarters = simulateFirstThreeQuarters(
          teamAttack,
          teamDefense,
          randomOpponent.attackValue,
          randomOpponent.defenseValue
        );
        
        setTeamScore(firstThreeQuarters.teamScore);
        setOpponentScore(firstThreeQuarters.opponentScore);
        
        // 設置介紹畫面
        setGameState('intro');
      } catch (error) {
        console.error('加載遊戲數據錯誤:', error);
        setGameLog(prev => [...prev, '加載遊戲數據時發生錯誤']);
      }
    };
    
    loadGameData();
  }, []);
  
  // 計時器效果
  useEffect(() => {
    if (gameState === 'playing' || gameState === 'critical') {
      timeIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) {
            clearInterval(timeIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
    };
  }, [gameState]);
  
  // 格式化時間為分鐘：秒
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // 處理回合完成
  const handleRoundComplete = (roundResult) => {
    // 更新比分
    setTeamScore(prevScore => prevScore + roundResult.points);
    setOpponentScore(prevScore => prevScore + roundResult.opponentPoints);
    
    // 更新已使用技能
    if (roundResult.usedSkill) {
      setUsedSkills(prev => [...prev, roundResult.usedSkill]);
    }
    
    // 添加回合紀錄
    setGameLog(prev => [...prev, `第${roundResult.round}回合(${roundResult.type === 'offense' ? '進攻' : '防守'}): ${roundResult.description}`]);
    
    // 進入下一回合
    setTimeout(() => {
      if (currentRound < 3) {
        setCurrentRound(prevRound => prevRound + 1);
      } else {
        // 進入關鍵時刻
        setGameState('critical');
      }
    }, 1000);
  };
  
  // 處理關鍵時刻完成
  const handleCriticalComplete = (criticalResult) => {
    // 更新比分
    setTeamScore(prevScore => prevScore + criticalResult.points);
    setOpponentScore(prevScore => prevScore + criticalResult.opponentPoints);
    
    // 更新已使用技能
    if (criticalResult.usedSkill) {
      setUsedSkills(prev => [...prev, criticalResult.usedSkill]);
    }
    
    // 添加關鍵時刻紀錄
    setGameLog(prev => [...prev, `關鍵時刻: ${criticalResult.description}`]);
    
    // 比賽結束
    setGameState('result');
  };
  
  // 開始比賽
  const startGame = () => {
    setGameState('playing');
    setCurrentRound(1);
  };
  
  // 重新開始比賽
  const restartGame = () => {
    window.location.reload();
  };
  
  // 渲染載入畫面
  if (gameState === 'loading') {
    return (
      <div className="game-container" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <h2>籃球隊比賽</h2>
        <p>載入遊戲數據中...</p>
      </div>
    );
  }
  
  // 渲染介紹畫面
  if (gameState === 'intro') {
    return (
      <div className="game-container" style={{ 
        textAlign: 'center', 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 0 15px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>籃球隊比賽</h2>
        <h3 style={{ color: '#e74c3c' }}>對陣: {opponent ? opponent.name : '未知對手'}</h3>
        
        <div className="score-display" style={{ 
          marginTop: '20px', 
          marginBottom: '20px',
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderRadius: '8px' 
        }}>
          <h3>前三節結束</h3>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
            <div>
              <p>我隊</p>
              <h2>{teamScore}</h2>
            </div>
            <div>
              <p>比分</p>
              <h2>-</h2>
            </div>
            <div>
              <p>對手</p>
              <h2>{opponentScore}</h2>
            </div>
          </div>
        </div>
        
        <p style={{ 
          fontSize: '18px', 
          margin: '20px 0',
          backgroundColor: teamScore > opponentScore ? '#d4edda' : teamScore < opponentScore ? '#f8d7da' : '#fff3cd',
          color: teamScore > opponentScore ? '#155724' : teamScore < opponentScore ? '#721c24' : '#856404',
          padding: '10px',
          borderRadius: '5px'
        }}>
          {teamScore > opponentScore 
            ? `你領先${teamScore - opponentScore}分!` 
            : teamScore < opponentScore 
            ? `你落後${opponentScore - teamScore}分!` 
            : '比分持平!'}
        </p>
        
        <p>現在進入第四節，你將控制球隊進行三回合的操作，最後還有關鍵10秒的比賽時間。</p>
        <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '20px auto', lineHeight: '1.6' }}>
          <li>回合1: 進攻回合</li>
          <li>回合2: 防守回合</li>
          <li>回合3: 自由選擇進攻或防守</li>
          <li>關鍵時刻: 最後10秒決定勝負</li>
        </ul>
        
        <button 
          onClick={startGame}
          style={{
            padding: '12px 30px',
            fontSize: '18px',
            backgroundColor: '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '20px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease'
          }}
        >
          開始比賽
        </button>
      </div>
    );
  }
  
  // 渲染關鍵時刻
  if (gameState === 'critical') {
    return (
      <div className="game-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <div className="game-header" style={{ marginBottom: '20px', textAlign: 'center' }}>
          <h2>第四節比賽 - 關鍵時刻</h2>
          <h3>對陣: {opponent?.name}</h3>
          
          <div className="score-display" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '15px' }}>
            <div>
              <p>我隊</p>
              <h2>{teamScore}</h2>
            </div>
            <div>
              <p>比分</p>
              <h2>-</h2>
            </div>
            <div>
              <p>{opponent?.name}</p>
              <h2>{opponentScore}</h2>
            </div>
          </div>
          
          <div className="time-display" style={{ marginTop: '10px' }}>
            <p>剩餘時間: <span style={{ fontWeight: 'bold', color: '#e74c3c' }}>{formatTime(timeLeft)}</span></p>
          </div>
        </div>
        
        <CriticalMoment
          players={players}
          skills={skills}
          usedSkills={usedSkills}
          opponent={opponent}
          teamScore={teamScore}
          opponentScore={opponentScore}
          onComplete={handleCriticalComplete}
        />
        
        <div className="game-log" style={{ marginTop: '30px', background: '#f8f9fa', padding: '15px', borderRadius: '5px', maxHeight: '150px', overflow: 'auto' }}>
          <h4>比賽紀錄:</h4>
          <ul style={{ padding: '0 0 0 20px' }}>
            {gameLog.map((log, index) => (
              <li key={index}>{log}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
  
  // 渲染結果畫面
  if (gameState === 'result') {
    const isWin = teamScore > opponentScore;
    const isDraw = teamScore === opponentScore;
    
    return (
      <div className="game-container" style={{ 
        textAlign: 'center', 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 0 15px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#2c3e50' }}>比賽結束!</h2>
        
        <div className="final-score" style={{ 
          marginTop: '20px', 
          marginBottom: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '10px',
          padding: '20px'
        }}>
          <h3>最終比分</h3>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px', marginTop: '15px' }}>
            <div>
              <p>我隊</p>
              <h2 style={{ fontSize: '36px', color: '#3498db' }}>{teamScore}</h2>
            </div>
            <div>
              <p>比分</p>
              <h2 style={{ fontSize: '36px' }}>-</h2>
            </div>
            <div>
              <p>{opponent?.name}</p>
              <h2 style={{ fontSize: '36px', color: '#e74c3c' }}>{opponentScore}</h2>
            </div>
          </div>
        </div>
        
        <h3 style={{ 
          marginTop: '30px', 
          color: isWin ? '#27ae60' : isDraw ? '#f39c12' : '#e74c3c',
          padding: '10px 20px',
          background: isWin ? '#d4edda' : isDraw ? '#fff3cd' : '#f8d7da',
          display: 'inline-block',
          borderRadius: '5px'
        }}>
          {isWin ? '恭喜，你贏了!' : isDraw ? '平局!' : '很遺憾，你輸了!'}
        </h3>
        
        <div className="game-log" style={{ marginTop: '30px', textAlign: 'left', background: '#f8f9fa', padding: '20px', borderRadius: '5px', maxHeight: '200px', overflow: 'auto', boxShadow: 'inset 0 0 5px rgba(0,0,0,0.1)' }}>
          <h4>比賽紀錄:</h4>
          <ul style={{ padding: '10px 0 0 20px' }}>
            {gameLog.map((log, index) => (
              <li key={index} style={{ marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>{log}</li>
            ))}
          </ul>
        </div>
        
        <button 
          onClick={restartGame}
          style={{
            padding: '12px 30px',
            fontSize: '18px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '30px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease'
          }}
        >
          再來一場
        </button>
      </div>
    );
  }
  
  // 渲染比賽畫面
  return (
    <div className="game-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div className="game-header" style={{ marginBottom: '20px', textAlign: 'center' }}>
        <h2>第四節比賽</h2>
        <h3>對陣: {opponent?.name}</h3>
        
        <div className="score-display" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '15px' }}>
          <div>
            <p>我隊</p>
            <h2>{teamScore}</h2>
          </div>
          <div>
            <p>比分</p>
            <h2>-</h2>
          </div>
          <div>
            <p>{opponent?.name}</p>
            <h2>{opponentScore}</h2>
          </div>
        </div>
        
        <div className="time-display" style={{ marginTop: '10px' }}>
          <p>剩餘時間: <span style={{ fontWeight: 'bold', color: '#e74c3c' }}>{formatTime(timeLeft)}</span></p>
        </div>
      </div>
      
      <div className="round-info" style={{ marginBottom: '10px', textAlign: 'center' }}>
        <h3>第{currentRound}/3回合</h3>
      </div>
      
      {/* 顯示當前回合 */}
      {currentRound === 1 && (
        <GameRound 
          round={1}
          type="offense"
          players={players}
          skills={skills}
          usedSkills={usedSkills}
          opponent={opponent}
          onRoundComplete={handleRoundComplete}
        />
      )}
      
      {currentRound === 2 && (
        <GameRound 
          round={2}
          type="defense"
          players={players}
          skills={skills}
          usedSkills={usedSkills}
          opponent={opponent}
          onRoundComplete={handleRoundComplete}
        />
      )}
      
      {currentRound === 3 && (
        <GameRound 
          round={3}
          type="choice"
          players={players}
          skills={skills}
          usedSkills={usedSkills}
          opponent={opponent}
          onRoundComplete={handleRoundComplete}
        />
      )}
      
      {/* 比賽紀錄 */}
      <div className="game-log" style={{ marginTop: '30px', background: '#f8f9fa', padding: '15px', borderRadius: '5px', maxHeight: '150px', overflow: 'auto' }}>
        <h4>比賽紀錄:</h4>
        <ul style={{ padding: '0 0 0 20px' }}>
          {gameLog.map((log, index) => (
            <li key={index}>{log}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Game;