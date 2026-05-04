<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fn" uri="jakarta.tags.functions" %>
<html>
<head>
  <title>Manage Bookings</title>
  <link rel="stylesheet" href="${pageContext.request.contextPath}/assets/css/style.css">
</head>
<body class="manager-dashboard-page manager-bookings-page">
<div class="manager-shell">
  <jsp:include page="../common/manager-sidebar.jsp"/>

  <main class="manager-content">
    <section class="bookings-head">
      <div>
        <h1>Manage Bookings</h1>
        <p>View and manage all customer charging reservations across your stations.</p>
      </div>
    </section>

    <section class="bookings-filter-card">
      <div class="bookings-search">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input id="bookingSearch" type="text" placeholder="Search by booking ID or user...">
      </div>
      <select id="stationFilter">
        <option value="">All Stations</option>
        <c:forEach var="b" items="${bookings}">
          <option value="${fn:toLowerCase(b.stationName)}">${b.stationName}</option>
        </c:forEach>
      </select>
      <input id="dateFilter" type="date">
      <select id="statusFilter">
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </section>

    <section class="bookings-table-card">
      <table>
        <thead>
        <tr>
          <th>Booking ID</th>
          <th>User</th>
          <th>Station</th>
          <th>Slot</th>
          <th>Vehicle Number</th>
          <th>Booking Status</th>
          <th>Action</th>
        </tr>
        </thead>
        <tbody id="bookingsTableBody">
        <c:forEach var="b" items="${bookings}">
          <tr
            data-search="bkg-${b.bookingId} ${fn:toLowerCase(b.userName)}"
            data-station="${fn:toLowerCase(b.stationName)}"
            data-date="${fn:substring(b.slotInfo,0,10)}"
            data-status="${fn:toLowerCase(b.bookingStatus)}">
            <td><strong>BKG-${b.bookingId}</strong></td>
            <td>${b.userName}</td>
            <td>${b.stationName}</td>
            <td>${b.slotInfo}</td>
            <td>${empty b.vehicleNumber ? '-' : b.vehicleNumber}</td>
            <td><span class="booking-status ${fn:toLowerCase(b.bookingStatus)}">${b.bookingStatus}</span></td>
            <td>
              <div class="booking-actions">
                <a href="${pageContext.request.contextPath}/station-manager/booking?id=${b.bookingId}" title="View Details"><i class="fa-regular fa-eye"></i></a>
                <form method="post">
                  <input type="hidden" name="action" value="bookingStatus">
                  <input type="hidden" name="bookingId" value="${b.bookingId}">
                  <input type="hidden" name="status" value="confirmed">
                  <button type="submit" title="Confirm"><i class="fa-solid fa-check"></i></button>
                </form>
                <form method="post">
                  <input type="hidden" name="action" value="bookingStatus">
                  <input type="hidden" name="bookingId" value="${b.bookingId}">
                  <input type="hidden" name="status" value="cancelled">
                  <button type="submit" class="danger" title="Cancel"><i class="fa-solid fa-xmark"></i></button>
                </form>
                <form method="post">
                  <input type="hidden" name="action" value="bookingStatus">
                  <input type="hidden" name="bookingId" value="${b.bookingId}">
                  <input type="hidden" name="status" value="completed">
                  <button type="submit" class="success" title="Mark Completed"><i class="fa-solid fa-circle-check"></i></button>
                </form>
              </div>
            </td>
          </tr>
        </c:forEach>
        <tr id="noBookingRows" style="display:none"><td colspan="7">No bookings match your filters.</td></tr>
        </tbody>
      </table>

      <div class="bookings-footer">
        <p>Showing <span id="showingBookings">${fn:length(bookings)}</span> of <strong>${fn:length(bookings)}</strong> entries</p>
      </div>
    </section>
  </main>
</div>

<script>
  (function () {
    const rows = Array.from(document.querySelectorAll("#bookingsTableBody tr[data-search]"));
    const searchInput = document.getElementById("bookingSearch");
    const stationFilter = document.getElementById("stationFilter");
    const dateFilter = document.getElementById("dateFilter");
    const statusFilter = document.getElementById("statusFilter");
    const noRows = document.getElementById("noBookingRows");
    const showing = document.getElementById("showingBookings");

    function applyFilters() {
      const search = searchInput.value.trim().toLowerCase();
      const station = stationFilter.value.trim().toLowerCase();
      const date = dateFilter.value.trim();
      const status = statusFilter.value.trim().toLowerCase();
      let visible = 0;

      rows.forEach((row) => {
        const rowSearch = row.dataset.search || "";
        const rowStation = row.dataset.station || "";
        const rowDate = row.dataset.date || "";
        const rowStatus = row.dataset.status || "";

        const okSearch = !search || rowSearch.includes(search);
        const okStation = !station || rowStation === station;
        const okDate = !date || rowDate === date;
        const okStatus = !status || rowStatus === status;
        const show = okSearch && okStation && okDate && okStatus;

        row.style.display = show ? "" : "none";
        if (show) visible++;
      });

      showing.textContent = String(visible);
      noRows.style.display = visible === 0 ? "" : "none";
    }

    searchInput.addEventListener("input", applyFilters);
    stationFilter.addEventListener("change", applyFilters);
    dateFilter.addEventListener("change", applyFilters);
    statusFilter.addEventListener("change", applyFilters);
    applyFilters();
  })();
</script>
</body>
</html>
