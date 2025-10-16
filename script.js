document.addEventListener("DOMContentLoaded", () => {
    // タブ切替
    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const target = btn.dataset.tab;
        document.querySelectorAll(".tab-content").forEach(tab => {
          tab.style.display = tab.id === target ? "block" : "none";
        });
      });
    });
  
    // --- カレンダー ---
    const calendar = document.getElementById("calendar");
    const monthYear = document.getElementById("month-year");
    const yearSelect = document.getElementById("year-select");
    const monthSelect = document.getElementById("month-select");
    const modal = document.getElementById("modal");
    const addBtn = document.getElementById("add-btn");
    const cancelBtn = document.getElementById("cancel-btn");
    const prevMonthBtn = document.getElementById("prev-month");
    const nextMonthBtn = document.getElementById("next-month");
    const openModalBtn = document.getElementById("open-modal-fixed");
  
    let currentDate = new Date();
    let tasks = JSON.parse(localStorage.getItem("tasks")||"[]");
  
    function initSelectors() {
      const currentYear = new Date().getFullYear();
      for(let y=currentYear-5;y<=currentYear+5;y++){
        const opt=document.createElement("option"); opt.value=y; opt.textContent=`${y}年`; yearSelect.appendChild(opt);
      }
      for(let m=1;m<=12;m++){
        const opt=document.createElement("option"); opt.value=m; opt.textContent=`${m}月`; monthSelect.appendChild(opt);
      }
    }
  
    function renderCalendar(date){
      const year=date.getFullYear(), month=date.getMonth();
      monthYear.textContent=`${year}年 ${month+1}月`;
      yearSelect.value=year; monthSelect.value=month+1;
      const firstDay=new Date(year,month,1).getDay();
      const daysInMonth=new Date(year,month+1,0).getDate();
      calendar.innerHTML="";
      for(let i=0;i<firstDay;i++){ calendar.appendChild(document.createElement("div")).classList.add("day");}
      for(let day=1;day<=daysInMonth;day++){
        const cell=document.createElement("div"); cell.classList.add("day");
        const number=document.createElement("div"); number.classList.add("day-number"); number.textContent=day; cell.appendChild(number);
        const dateStr=`${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
        const weekday=new Date(year,month,day).getDay();
        if(weekday===0) cell.classList.add("sunday"); 
        if(weekday===6) cell.classList.add("saturday");
        if(day===currentDate.getDate() && month===currentDate.getMonth() && year===currentDate.getFullYear()) cell.classList.add("today");
  
        tasks.forEach(t=>{
          if(t.deadline.startsWith(dateStr)){
            const taskEl=document.createElement("div"); taskEl.classList.add("task"); 
            const now=new Date(), taskDate=new Date(t.deadline); 
            const diff=Math.ceil((taskDate-now)/(1000*60*60*24));
            if(diff<=1) taskEl.style.background="red"; 
            else if(diff>=3&&diff<=5) taskEl.style.background="yellow"; 
            else taskEl.style.background="#007bff";
            taskEl.textContent=`${t.subject}：${t.title}`; cell.appendChild(taskEl);
          }
        });
  
        // セルクリックで詳細モーダル
        cell.addEventListener("click",()=>{ openCalendarDetail(dateStr); });
        calendar.appendChild(cell);
      }
    }
  
    // --- カレンダー詳細モーダル ---
    const calendarDetailModal=document.getElementById("calendar-detail-modal");
    const calendarTaskList=document.getElementById("calendar-task-list");
    const calendarDetailDate=document.getElementById("calendar-detail-date");
    const addDetailTaskBtn=document.getElementById("add-detail-task-btn");
    const detailTaskSubject=document.getElementById("detail-task-subject");
    const detailTaskTitle=document.getElementById("detail-task-title");
    const detailTaskDeadline=document.getElementById("detail-task-deadline");
    const closeCalendarDetailBtn=document.getElementById("close-calendar-detail-btn");
  
    let currentDetailDate="";
    function openCalendarDetail(dateStr){
      currentDetailDate=dateStr;
      calendarDetailDate.textContent=dateStr+"の予定";
      renderCalendarDetailTasks();
      calendarDetailModal.style.display="flex";
    }
  
    function renderCalendarDetailTasks(){
      calendarTaskList.innerHTML="";
      tasks.filter(t=>t.deadline.startsWith(currentDetailDate)).forEach((t,i)=>{
        const div=document.createElement("div");
        div.style.borderBottom="1px solid #ccc"; div.style.marginBottom="2px"; div.style.padding="2px";
        div.textContent=`${t.deadline.substring(11,16)} ${t.subject}: ${t.title}`;
        const editBtn=document.createElement("button"); editBtn.textContent="編集"; editBtn.style.margin="2px";
        const delBtn=document.createElement("button"); delBtn.textContent="削除"; delBtn.style.margin="2px";
        editBtn.addEventListener("click",()=>{
          const newSub=prompt("科目名",t.subject); 
          const newTitle=prompt("内容",t.title);
          const newDead=t.deadline;
          if(newSub && newTitle){ t.subject=newSub; t.title=newTitle; localStorage.setItem("tasks",JSON.stringify(tasks)); renderCalendar(currentDate); renderCalendarDetailTasks();}
        });
        delBtn.addEventListener("click",()=>{ tasks.splice(tasks.indexOf(t),1); localStorage.setItem("tasks",JSON.stringify(tasks)); renderCalendar(currentDate); renderCalendarDetailTasks(); });
        div.appendChild(editBtn); div.appendChild(delBtn);
        calendarTaskList.appendChild(div);
      });
    }
  
    addDetailTaskBtn.addEventListener("click",()=>{
      const sub=detailTaskSubject.value;
      const title=detailTaskTitle.value;
      const dead=detailTaskDeadline.value;
      if(sub && title && dead){
        tasks.push({subject:sub,title:title,deadline:dead});
        localStorage.setItem("tasks",JSON.stringify(tasks));
        detailTaskSubject.value=""; detailTaskTitle.value=""; detailTaskDeadline.value="";
        renderCalendar(currentDate); renderCalendarDetailTasks();
      }
    });
  
    closeCalendarDetailBtn.addEventListener("click",()=>{calendarDetailModal.style.display="none";});
  
    // 省略：カレンダーナビ、モーダル追加ボタン
    prevMonthBtn.addEventListener("click",()=>{currentDate.setMonth(currentDate.getMonth()-1); renderCalendar(currentDate);});
    nextMonthBtn.addEventListener("click",()=>{currentDate.setMonth(currentDate.getMonth()+1); renderCalendar(currentDate);});
    openModalBtn.addEventListener("click",()=>{modal.style.display="flex";});
    cancelBtn.addEventListener("click",()=>{modal.style.display="none";});
    addBtn.addEventListener("click",()=>{
      const subject=document.getElementById("subject").value;
      const title=document.getElementById("title").value;
      const deadline=document.getElementById("deadline").value;
      if(subject && title && deadline){ 
        tasks.push({subject,title,deadline}); 
        localStorage.setItem("tasks",JSON.stringify(tasks)); 
        renderCalendar(currentDate); 
        modal.style.display="none"; 
        document.getElementById("subject").value=""; 
        document.getElementById("title").value=""; 
        document.getElementById("deadline").value=""; 
      }
    });
  
    initSelectors(); renderCalendar(currentDate);
  
    // --- 時間割 ---
    const timetableBody=document.getElementById("timetable-body");
    const addClassBtn=document.getElementById("add-class-btn");
    const classModal=document.getElementById("class-modal");
    const cancelClassBtn=document.getElementById("cancel-class-btn");
    const addClassConfirmBtn=document.getElementById("add-class-confirm-btn");
    let classes=JSON.parse(localStorage.getItem("classes")||"[]");
  
    const hours=[
      {label:"1限", start:"09:00", end:"10:30"},
      {label:"2限", start:"10:40", end:"12:10"},
      {label:"3限", start:"12:55", end:"14:25"},
      {label:"4限", start:"14:35", end:"16:05"},
      {label:"5限", start:"16:15", end:"17:45"},
      {label:"6限", start:"17:55", end:"19:25"}
    ];
  
    addClassBtn.addEventListener("click",()=>{classModal.style.display="flex";});
    cancelClassBtn.addEventListener("click",()=>{classModal.style.display="none";});
    addClassConfirmBtn.addEventListener("click",()=>{
      const name=document.getElementById("class-name").value.trim();
      const room=document.getElementById("class-room").value.trim();
      const day=parseInt(document.getElementById("class-day").value);
      const time=parseInt(document.getElementById("class-time").value);
      if(name && day && time){
        classes.push({name, room, day, time, attendance:0, absence:0});
        localStorage.setItem("classes",JSON.stringify(classes));
        renderTimetable();
        classModal.style.display="none";
        document.getElementById("class-name").value="";
        document.getElementById("class-room").value="";
      }
    });
  
    // --- 時間割詳細モーダル ---
    const classDetailModal=document.getElementById("class-detail-modal");
    const detailClassName=document.getElementById("detail-class-name");
    const detailClassRoom=document.getElementById("detail-class-room");
    const detailAttendance=document.getElementById("detail-attendance");
    const detailAttendanceBtn=document.getElementById("detail-attendance-btn");
    const detailAttendanceCancelBtn=document.getElementById("detail-attendance-cancel-btn");
    const detailAbsence=document.getElementById("detail-absence");
    const detailAbsenceBtn=document.getElementById("detail-absence-btn");
    const detailAbsenceCancelBtn=document.getElementById("detail-absence-cancel-btn");
    const updateClassBtn=document.getElementById("update-class-btn");
    const deleteClassBtn=document.getElementById("delete-class-btn");
    const closeClassDetailBtn=document.getElementById("close-class-detail-btn");
    let currentClassIndex=null;
  
    function openClassDetail(idx){
      currentClassIndex=idx;
      const cls=classes[idx];
      detailClassName.value=cls.name;
      detailClassRoom.value=cls.room;
      detailAttendance.textContent=cls.attendance;
      detailAbsence.textContent=cls.absence;
      classDetailModal.style.display="flex";
    }
  
    detailAttendanceBtn.addEventListener("click",()=>{
      if(currentClassIndex===null) return;
      classes[currentClassIndex].attendance++; updateClass();
    });
    detailAttendanceCancelBtn.addEventListener("click",()=>{
      if(currentClassIndex===null) return;
      if(classes[currentClassIndex].attendance>0) classes[currentClassIndex].attendance--; updateClass();
    });
    detailAbsenceBtn.addEventListener("click",()=>{
      if(currentClassIndex===null) return;
      classes[currentClassIndex].absence++; updateClass();
    });
    detailAbsenceCancelBtn.addEventListener("click",()=>{
      if(currentClassIndex===null) return;
      if(classes[currentClassIndex].absence>0) classes[currentClassIndex].absence--; updateClass();
    });
    updateClassBtn.addEventListener("click",()=>{
      if(currentClassIndex===null) return;
      classes[currentClassIndex].name=detailClassName.value;
      classes[currentClassIndex].room=detailClassRoom.value;
      updateClass();
    });
    deleteClassBtn.addEventListener("click",()=>{
      if(currentClassIndex===null) return;
      classes.splice(currentClassIndex,1);
      localStorage.setItem("classes",JSON.stringify(classes));
      renderTimetable();
      classDetailModal.style.display="none";
    });
    closeClassDetailBtn.addEventListener("click",()=>{classDetailModal.style.display="none"; currentClassIndex=null;});
  
    function updateClass(){ localStorage.setItem("classes",JSON.stringify(classes)); renderTimetable(); detailAttendance.textContent=classes[currentClassIndex].attendance; detailAbsence.textContent=classes[currentClassIndex].absence;}
  
    function renderTimetable(){
      timetableBody.innerHTML="";
      hours.forEach((h,i)=>{
        const tr=document.createElement("tr");
        const tdTime=document.createElement("td");
        tdTime.innerHTML=`${h.label}<br><small>${h.start}～${h.end}</small>`;
        tr.appendChild(tdTime);
        for(let d=1;d<=5;d++){
          const td=document.createElement("td");
          const idx=classes.findIndex(c=>c.day==d && c.time==i+1);
          if(idx!==-1){
            const cls=classes[idx];
            td.innerHTML=`<div>${cls.name}<br><small>${cls.room}</small></div>`;
            td.addEventListener("click",()=>{ openClassDetail(idx); });
          }
          tr.appendChild(td);
        }
        timetableBody.appendChild(tr);
      });
    }
  
    function fitTimetable() {
      const timetable = document.querySelector("#timetable table");
      const rows = timetable.rows.length;
      const availableHeight = window.innerHeight - document.querySelector(".content").offsetTop - 20;
      const rowHeight = Math.floor(availableHeight / rows);
      for(let r=1; r<rows; r++){ timetable.rows[r].style.height = rowHeight + "px"; }
    }
  
    window.addEventListener("resize",()=>{fitTimetable();});
    renderTimetable(); fitTimetable();
  });
  