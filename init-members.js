<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>ระบบเก็บเงินห้อง</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      margin: 0;
      font-family: 'Arial', sans-serif;
      background: #a06cd5;
      color: white;
    }
    .app-container {
      padding: 20px;
      max-width: 1000px;
      margin: auto;
    }
    .app-header {
      text-align: center;
      margin-bottom: 20px;
    }
    .nav-tabs {
      display: flex;
      justify-content: space-around;
      background: #7a4fcf;
      padding: 10px;
      border-radius: 8px;
    }
    .tab-btn {
      background: transparent;
      border: none;
      color: white;
      font-weight: bold;
      cursor: pointer;
    }
    .tab-btn.active {
      border-bottom: 3px solid white;
    }
    .tab-content {
      margin-top: 20px;
    }
    .tab-panel {
      display: none;
    }
    .tab-panel.active {
      display: block;
    }
    .summary-container {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }
    .summary-box {
      background: #c59ef9;
      padding: 20px;
      flex: 1;
      min-width: 200px;
      border-radius: 12px;
      text-align: center;
    }
    .button-row {
      margin-top: 20px;
    }
    .button-row button {
      margin-right: 10px;
      padding: 10px 15px;
      border: none;
      background: #4b2fad;
      color: white;
      border-radius: 8px;
      cursor: pointer;
    }
    .activity-log {
      background: #c59ef9;
      padding: 20px;
      border-radius: 12px;
      margin-top: 10px;
    }
    .member-list {
      background: #c59ef9;
      border-radius: 12px;
      padding: 20px;
    }
    .member {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      border-bottom: 1px solid white;
    }
    .member.unpaid {
      background: #e74c3c;
      padding: 5px;
      border-radius: 5px;
    }
    .app-footer {
      margin-top: 40px;
      text-align: center;
      font-size: 0.9em;
    }
  </style>

  <!-- Firebase -->
  <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
  <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js"></script>
</head>
<body>
  <div class="app-container">
    <div class="app-header">
      <h1>ระบบเก็บเงินห้อง</h1>
      <p>เก็บเงินอาทิตย์ละ 10 บาท</p>
    </div>

    <div class="nav-tabs">
      <button class="tab-btn active" onclick="showTab('tabHome')">หน้าหลัก</button>
      <button class="tab-btn" onclick="showTab('tabMembers')">รายชื่อสมาชิก</button>
      <button class="tab-btn" onclick="showTab('tabWeeks')">จัดการสัปดาห์</button>
    </div>

    <div class="tab-content">
      <div id="tabHome" class="tab-panel active">
        <div class="summary-container">
          <div class="summary-box"><h3>จำนวนสมาชิกทั้งหมด</h3><p id="totalMembers">0</p></div>
          <div class="summary-box"><h3>จำนวนเงินที่เก็บได้ทั้งหมด</h3><p id="totalCollected">0 บาท</p></div>
          <div class="summary-box"><h3>จำนวนเงินที่ค้างชำระ</h3><p id="totalUnpaid">0 บาท</p></div>
        </div>
        <div class="button-row">
          <button onclick="openAddWeek()">+ เพิ่มสัปดาห์</button>
          <button onclick="openAddMembers()">+ เพิ่มสมาชิก</button>
        </div>
        <h3>กิจกรรมล่าสุด</h3>
        <div class="activity-log" id="latestActivityLog"></div>
      </div>

      <div id="tabMembers" class="tab-panel">
        <h3>รายชื่อสมาชิก</h3>
        <div class="member-list" id="memberList"></div>
      </div>

      <div id="tabWeeks" class="tab-panel">
        <h3>จัดการสัปดาห์ (อยู่ระหว่างพัฒนา)</h3>
      </div>
    </div>

    <div class="app-footer">
      © 2023 ระบบเก็บเงินห้อง | ข้อมูลถูกบันทึกใน Firebase
    </div>
  </div>

  <script>
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      databaseURL: "YOUR_DB_URL",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_BUCKET",
      messagingSenderId: "YOUR_MSG_ID",
      appId: "YOUR_APP_ID"
    };
    firebase.initializeApp(firebaseConfig);

    function showTab(id) {
      document.querySelectorAll('.tab-panel').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      document.getElementById(id).classList.add('active');
      document.querySelector(`.tab-btn[onclick="showTab('${id}')"]`).classList.add('active');
      if(id === "tabMembers") loadMembers();
    }

    function loadMembers() {
      const list = document.getElementById("memberList");
      list.innerHTML = "";
      firebase.database().ref("members").once("value", snapshot => {
        const data = snapshot.val() || {};
        Object.values(data).forEach(member => {
          const div = document.createElement("div");
          div.className = "member";
          div.textContent = member.name;
          list.appendChild(div);
        });
        document.getElementById("totalMembers").textContent = Object.keys(data).length;
      });
    }

    function openAddMembers() {
      const names = prompt("กรอกชื่อสมาชิก (คั่นด้วย ,)").split(",");
      const updates = {};
      names.forEach(name => {
        const id = firebase.database().ref("members").push().key;
        updates[id] = { name: name.trim(), created: Date.now() };
      });
      firebase.database().ref("members").update(updates).then(() => {
        alert("เพิ่มสมาชิกเรียบร้อยแล้ว");
        loadMembers();
      });
    }

    function openAddWeek() {
      const weekName = prompt("ระบุชื่อสัปดาห์:");
      if (weekName) {
        const logRef = firebase.database().ref("activity").push();
        logRef.set({ action: "เพิ่มสัปดาห์ " + weekName, timestamp: Date.now() });
        alert("เพิ่มสัปดาห์สำเร็จ");
        loadLatestActivity();
      }
    }

    function loadLatestActivity() {
      const log = document.getElementById("latestActivityLog");
      log.innerHTML = "";
      firebase.database().ref("activity").limitToLast(5).once("value", snap => {
        snap.forEach(child => {
          const p = document.createElement("p");
          p.textContent = new Date(child.val().timestamp).toLocaleString() + " - " + child.val().action;
          log.appendChild(p);
        });
      });
    }

    window.onload = function() {
      loadMembers();
      loadLatestActivity();
    };
  </script>
</body>
</html>
