/**
 * 用於加載遊戲數據的函數
 */

// 直接導入數據文件
import players from '../data/players.json';
import skills from '../data/skills.json';
import opponents from '../data/opponents.json';
import team from '../data/team.json';

// 加載球員數據
export const loadPlayers = async () => {
  try {
    return players;
  } catch (error) {
    console.error('加載球員數據錯誤:', error);
    return [];
  }
};

// 加載技能數據
export const loadSkills = async () => {
  try {
    return skills;
  } catch (error) {
    console.error('加載技能數據錯誤:', error);
    return [];
  }
};

// 加載對手數據
export const loadOpponents = async () => {
  try {
    return opponents;
  } catch (error) {
    console.error('加載對手數據錯誤:', error);
    return [];
  }
};

// 加載隊伍數據
export const loadTeam = async () => {
  try {
    return team;
  } catch (error) {
    console.error('加載隊伍數據錯誤:', error);
    return {};
  }
};

// 計算隊伍平均攻擊值
export const calculateTeamAttack = (players) => {
  if (!players || players.length === 0) return 0;
  const totalAttack = players.reduce((sum, player) => sum + player.attackValue, 0);
  return Math.floor(totalAttack / players.length);
};

// 計算隊伍平均防守值
export const calculateTeamDefense = (players) => {
  if (!players || players.length === 0) return 0;
  const totalDefense = players.reduce((sum, player) => sum + player.defenseValue, 0);
  return Math.floor(totalDefense / players.length);
};

// 模擬前三節比賽結果
export const simulateFirstThreeQuarters = (teamAttack, teamDefense, opponentAttack, opponentDefense) => {
  const randomFactor1 = 0.8 + (Math.random() * 0.4); // 0.8-1.2
  const randomFactor2 = 0.8 + (Math.random() * 0.4); // 0.8-1.2
  
  const teamScore = Math.floor((teamAttack - opponentDefense * 0.7) * randomFactor1 * 3);
  const opponentScore = Math.floor((opponentAttack - teamDefense * 0.7) * randomFactor2 * 3);
  
  return {
    teamScore: Math.max(teamScore, 30), // 確保至少有30分
    opponentScore: Math.max(opponentScore, 30), // 確保至少有30分
    scoreDifference: teamScore - opponentScore
  };
};

// 獲取球員技能
export const getPlayerSkill = (playerId, players, skills) => {
  const player = players.find(p => p.id === playerId);
  if (!player) return null;
  
  const skill = skills.find(s => s.id === player.skillId);
  return skill || null;
};