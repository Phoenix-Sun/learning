import { useState } from 'react';

/**
 * 球隊經營組件
 * 預留用於球隊經營部分的功能
 */
const Management = () => {
  return (
    <div className="management-container" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>球隊經營</h2>
      <p>此功能尚在開發中...</p>
      
      <div style={{ marginTop: '50px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <h3>即將推出的功能</h3>
        <ul style={{ textAlign: 'left', maxWidth: '500px', margin: '20px auto', lineHeight: '1.6' }}>
          <li>球員招募與培訓</li>
          <li>球隊設施升級</li>
          <li>財務管理</li>
          <li>贊助合約</li>
          <li>球季排程</li>
        </ul>
      </div>
    </div>
  );
};

export default Management;