<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fn" uri="jakarta.tags.functions" %>
<html>
<head>
  <title>Manage Assigned Stations</title>
  <link rel="stylesheet" href="${pageContext.request.contextPath}/assets/css/style.css">
</head>
<body class="manager-dashboard-page manager-stations-page">
<div class="manager-shell">
  <jsp:include page="../common/manager-sidebar.jsp"/>

  <main class="manager-content">
    <section class="stations-head">
      <div>
        <h1>Manage Assigned Stations</h1>
        <p>View and manage all electric vehicle charging stations assigned to you.</p>
      </div>
      <c:choose>
        <c:when test="${not empty firstStationId}">
          <a class="stations-request-btn" href="${pageContext.request.contextPath}/station-manager/station-form?id=${firstStationId}">
            <i class="fa-solid fa-plus"></i> Request New Station
          </a>
        </c:when>
        <c:otherwise>
          <a class="stations-request-btn" href="${pageContext.request.contextPath}/station-manager/stations">
            <i class="fa-solid fa-plus"></i> Request New Station
          </a>
        </c:otherwise>
      </c:choose>
    </section>

    <section class="stations-filters-card">
      <div class="stations-search">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input id="stationSearch" type="text" placeholder="Search by station name or ID...">
      </div>
      <select id="statusFilter">
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="maintenance">Maintenance</option>
        <option value="offline">Offline</option>
      </select>
      <select id="districtFilter">
        <option value="">All Districts</option>
        <c:forEach var="s" items="${stations}">
          <option value="${fn:toLowerCase(s.districtName)}">${s.districtName}</option>
        </c:forEach>
      </select>
      <button class="stations-filter-btn" type="button" title="Filters">
        <i class="fa-solid fa-filter"></i>
      </button>
    </section>

    <section class="stations-table-card">
      <table>
        <thead>
        <tr>
          <th>Station Details</th>
          <th>Location</th>
          <th>Ports (Avail/Total)</th>
          <th>Charger Types</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody id="stationsTableBody">
        <c:forEach var="s" items="${stations}">
          <tr
            data-station="${fn:toLowerCase(s.stationName)} stn-${s.stationId}"
            data-status="${fn:toLowerCase(s.status)}"
            data-district="${fn:toLowerCase(s.districtName)}">
            <td>
              <div class="st-name">${s.stationName}</div>
              <div class="st-sub">STN-${s.stationId}</div>
            </td>
            <td>
              <div class="st-location"><i class="fa-solid fa-location-dot"></i> ${s.districtName}</div>
              <div class="st-sub">${s.address}</div>
            </td>
            <td>
              <div class="st-ports"><i class="fa-solid fa-bolt"></i> <strong>${s.totalPorts}/${s.totalPorts}</strong></div>
            </td>
            <td>
              <span class="st-chip">${s.chargerType}</span>
            </td>
            <td>
              <span class="st-status ${fn:toLowerCase(s.status)}">${s.status}</span>
              <div class="st-sub">Sync: just now</div>
            </td>
            <td>
              <div class="st-actions">
                <a href="${pageContext.request.contextPath}/station-manager/station-form?id=${s.stationId}"><i class="fa-solid fa-pen-to-square"></i> Edit</a>
                <a href="${pageContext.request.contextPath}/station-manager/slots"><i class="fa-regular fa-clock"></i> Schedule</a>
              </div>
            </td>
          </tr>
        </c:forEach>
        <tr id="noResultsRow" style="display:none">
          <td colspan="6">No stations match your filters.</td>
        </tr>
        </tbody>
      </table>

      <div class="stations-footer">
        <p>Showing <span id="showingCount">${fn:length(stations)}</span> of <strong>${fn:length(stations)}</strong> results</p>
        <div class="stations-pager">
          <button type="button"><i class="fa-solid fa-angle-left"></i></button>
          <button type="button" class="active">1</button>
          <button type="button"><i class="fa-solid fa-angle-right"></i></button>
        </div>
      </div>
    </section>
  </main>
</div>

<script>
  (function () {
    const searchInput = document.getElementById("stationSearch");
    const statusFilter = document.getElementById("statusFilter");
    const districtFilter = document.getElementById("districtFilter");
    const rows = Array.from(document.querySelectorAll("#stationsTableBody tr[data-station]"));
    const noResult = document.getElementById("noResultsRow");
    const showingCount = document.getElementById("showingCount");

    function applyFilters() {
      const search = searchInput.value.trim().toLowerCase();
      const status = statusFilter.value.trim().toLowerCase();
      const district = districtFilter.value.trim().toLowerCase();
      let visible = 0;

      rows.forEach((row) => {
        const station = row.dataset.station || "";
        const rowStatus = row.dataset.status || "";
        const rowDistrict = row.dataset.district || "";
        const matchSearch = !search || station.includes(search);
        const matchStatus = !status || rowStatus === status;
        const matchDistrict = !district || rowDistrict === district;
        const show = matchSearch && matchStatus && matchDistrict;
        row.style.display = show ? "" : "none";
        if (show) visible++;
      });

      showingCount.textContent = String(visible);
      noResult.style.display = visible === 0 ? "" : "none";
    }

    searchInput.addEventListener("input", applyFilters);
    statusFilter.addEventListener("change", applyFilters);
    districtFilter.addEventListener("change", applyFilters);
  })();
</script>
</body>
</html>
