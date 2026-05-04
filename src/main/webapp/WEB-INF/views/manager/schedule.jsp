<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fn" uri="jakarta.tags.functions" %>
<html>
<head>
  <title>Station Schedule</title>
  <link rel="stylesheet" href="${pageContext.request.contextPath}/assets/css/style.css">
</head>
<body class="manager-dashboard-page manager-schedule-page">
<div class="manager-shell">
  <jsp:include page="../common/manager-sidebar.jsp"/>

  <main class="manager-content">
    <section class="schedule-head">
      <div>
        <h1>Station Schedule</h1>
        <p>Manage operating hours, timezone, and recurring slots.</p>
      </div>
      <div class="schedule-head-actions">
        <form method="post">
          <input type="hidden" name="action" value="discardSchedule">
          <input type="hidden" name="stationId" value="${empty selectedStation ? '' : selectedStation.stationId}">
          <button class="btn-discard" type="submit"><i class="fa-solid fa-rotate-left"></i> Discard Changes</button>
        </form>
        <form method="post">
          <input type="hidden" name="action" value="saveSchedule">
          <input type="hidden" name="stationId" value="${empty selectedStation ? '' : selectedStation.stationId}">
          <input type="hidden" name="openingTime" id="saveOpeningTime" value="${empty selectedStation ? '06:00' : fn:substring(selectedStation.openingTime,0,5)}">
          <input type="hidden" name="closingTime" id="saveClosingTime" value="${empty selectedStation ? '23:00' : fn:substring(selectedStation.closingTime,0,5)}">
          <input type="hidden" name="activeDays" id="saveActiveDays" value="Mon,Tue,Wed,Thu,Fri,Sat">
          <button class="btn-save" type="submit"><i class="fa-regular fa-floppy-disk"></i> Save Schedule</button>
        </form>
      </div>
    </section>

    <section class="schedule-grid">
      <div class="schedule-left">
        <article class="schedule-card">
          <h2><i class="fa-solid fa-sliders"></i> General Settings</h2>
          <form method="get" class="schedule-settings-form">
            <label>Selected Station</label>
            <select name="stationId" onchange="this.form.submit()">
              <c:choose>
                <c:when test="${empty stations}">
                  <option>No stations assigned</option>
                </c:when>
                <c:otherwise>
                  <c:forEach var="station" items="${stations}">
                    <option value="${station.stationId}" ${selectedStation.stationId == station.stationId ? 'selected' : ''}>${station.stationName}</option>
                  </c:forEach>
                </c:otherwise>
              </c:choose>
            </select>
            <label>Timezone</label>
            <div class="timezone-field">
              <input type="text" value="Asia/Kathmandu (NPT)" readonly>
              <i class="fa-solid fa-globe"></i>
            </div>
            <small><i class="fa-solid fa-circle-info"></i> All schedule times are based on this timezone.</small>
          </form>
        </article>

        <article class="schedule-card">
          <h2><i class="fa-regular fa-clock"></i> Operating Hours</h2>
          <p class="section-sub">Set the default daily active window.</p>
          <div class="hours-grid">
            <div>
              <label>Start Time</label>
              <input id="openingTimeField" type="time" value="${empty selectedStation ? '06:00' : fn:substring(selectedStation.openingTime,0,5)}">
            </div>
            <div>
              <label>End Time</label>
              <input id="closingTimeField" type="time" value="${empty selectedStation ? '23:00' : fn:substring(selectedStation.closingTime,0,5)}">
            </div>
          </div>
          <div class="recurrence-block">
            <label class="recurrence-label">Recurrence (Days Active)</label>
            <div class="weekday-pills">
              <button type="button" class="active" data-day="Mon">M</button>
              <button type="button" class="active" data-day="Tue">T</button>
              <button type="button" class="active" data-day="Wed">W</button>
              <button type="button" class="active" data-day="Thu">T</button>
              <button type="button" class="active" data-day="Fri">F</button>
              <button type="button" class="active" data-day="Sat">S</button>
              <button type="button" data-day="Sun">S</button>
            </div>
          </div>
        </article>

        <article class="schedule-card">
          <h2><i class="fa-solid fa-triangle-exclamation"></i> Maintenance Blocks</h2>
          <p class="section-sub">Override operating hours with offline periods.</p>
          <div class="maint-block">
            <strong>Weekly System Check</strong>
            <small>Every Mon, 13:00 - 15:00</small>
            <small>Applies to: All Ports</small>
          </div>
          <div class="maint-block">
            <strong>Port 3 Diagnostic</strong>
            <small>Today, 18:00 - 20:00</small>
            <small>Applies to: Port 3 Only</small>
          </div>
          <button type="button" class="maint-add-btn"><i class="fa-solid fa-plus"></i> Add Maintenance Block</button>
        </article>
      </div>

      <div class="schedule-right">
        <article class="schedule-card visual-overview">
          <div class="overview-head">
            <div>
              <h2><i class="fa-regular fa-calendar-days"></i> Visual Schedule Overview</h2>
              <p>Displaying current configuration for: <strong>Monday</strong></p>
            </div>
            <div class="legend">
              <span>LEGEND:</span>
              <em class="lg-available">Available</em>
              <em class="lg-maintenance">Maintenance</em>
              <em class="lg-offline">Offline</em>
            </div>
          </div>

          <div class="timeline-scale">
            <span>00:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span><span>24:00</span>
          </div>

          <div id="portOverviewRows">
            <c:forEach var="i" begin="1" end="${empty selectedStation ? 1 : selectedStation.totalPorts}">
              <div class="port-row">
                <div class="port-meta">
                  <strong>Port ${i} (${empty selectedStation ? 'Type 2' : selectedStation.chargerType})</strong>
                  <small>Max Power: ${i == 1 ? '120kW' : (i == 2 ? '60kW' : '22kW')}</small>
                </div>
                <div class="port-track" data-port="${i}"></div>
              </div>
            </c:forEach>
          </div>

          <div class="schedule-note"><i class="fa-regular fa-circle-info"></i> Hover over blocks to see exact start and end times. Click and drag is not supported in this view.</div>
        </article>
      </div>
    </section>
  </main>
</div>

<script>
  (function () {
    const opening = document.getElementById("openingTimeField");
    const closing = document.getElementById("closingTimeField");
    const saveOpen = document.getElementById("saveOpeningTime");
    const saveClose = document.getElementById("saveClosingTime");
    const saveActiveDays = document.getElementById("saveActiveDays");
    const dayButtons = Array.from(document.querySelectorAll(".weekday-pills button[data-day]"));
    const tracks = Array.from(document.querySelectorAll(".port-track"));

    function parseMinutes(value) {
      if (!value || value.indexOf(":") < 0) return 0;
      const parts = value.split(":");
      const h = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      return (h * 60) + m;
    }

    function pct(minutes) {
      return Math.max(0, Math.min(100, (minutes / 1440) * 100));
    }

    function createSegment(cls, widthPercent, label) {
      const seg = document.createElement("div");
      seg.className = "seg " + cls;
      seg.style.width = widthPercent.toFixed(2) + "%";
      seg.textContent = label || "";
      return seg;
    }

    function redrawOverview() {
      const openMins = parseMinutes(opening.value || "06:00");
      const closeMins = parseMinutes(closing.value || "23:00");
      const activeDays = dayButtons.filter((b) => b.classList.contains("active")).length;
      tracks.forEach((track, index) => {
        track.innerHTML = "";
        if (activeDays === 0 || closeMins <= openMins) {
          track.appendChild(createSegment("offline", 100, "Offline"));
          return;
        }

        const pre = pct(openMins);
        const active = pct(closeMins - openMins);
        const post = Math.max(0, 100 - pre - active);

        if (pre > 0) track.appendChild(createSegment("offline", pre, "Offline"));

        const maintenanceStart = 780 + (index * 20);
        const maintenanceEnd = maintenanceStart + 90;
        const maintWithinStart = Math.max(openMins, maintenanceStart);
        const maintWithinEnd = Math.min(closeMins, maintenanceEnd);

        if (maintWithinEnd <= maintWithinStart) {
          track.appendChild(createSegment("available", active, "Available"));
        } else {
          const firstAvail = pct(maintWithinStart - openMins);
          const maint = pct(maintWithinEnd - maintWithinStart);
          const secondAvail = Math.max(0, active - firstAvail - maint);
          if (firstAvail > 0) track.appendChild(createSegment("available", firstAvail, "Available"));
          track.appendChild(createSegment("maintenance", maint, ""));
          if (secondAvail > 0) track.appendChild(createSegment("available", secondAvail, "Available"));
        }

        if (post > 0) track.appendChild(createSegment("offline", post, "Offline"));
      });
    }

    function syncActiveDays() {
      const days = dayButtons.filter((b) => b.classList.contains("active")).map((b) => b.dataset.day);
      saveActiveDays.value = days.join(",");
      redrawOverview();
    }

    if (opening && saveOpen) {
      opening.addEventListener("input", function () {
        saveOpen.value = opening.value;
        redrawOverview();
      });
    }
    if (closing && saveClose) {
      closing.addEventListener("input", function () {
        saveClose.value = closing.value;
        redrawOverview();
      });
    }
    dayButtons.forEach((button) => {
      button.addEventListener("click", function () {
        button.classList.toggle("active");
        syncActiveDays();
      });
    });
    if (opening && closing) {
      redrawOverview();
      syncActiveDays();
    }
  })();
</script>
</body>
</html>
