<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<html>
<head>
  <title>Manager Dashboard</title>
  <link rel="stylesheet" href="${pageContext.request.contextPath}/assets/css/style.css">
</head>
<body class="manager-dashboard-page">
<div class="manager-shell">
  <jsp:include page="../common/manager-sidebar.jsp"/>

  <main class="manager-content">
    <section class="manager-topbar">
      <div>
        <h1>Dashboard</h1>
        <p>Here's what's happening at your stations today, ${dashboardDate}.</p>
      </div>
      <div class="manager-system-status"><i class="fa-solid fa-wave-square"></i>System Status: Healthy</div>
    </section>

    <section class="manager-metrics">
      <article class="manager-metric-card">
        <div>
          <p>Assigned Stations</p>
          <h3>${stationCount}</h3>
          <span><i class="fa-solid fa-arrow-up-right"></i> +1 from last month</span>
        </div>
        <i class="fa-solid fa-location-dot metric-icon"></i>
      </article>
      <article class="manager-metric-card">
        <div>
          <p>Total Slots</p>
          <h3>${slotCount}</h3>
          <span><i class="fa-solid fa-arrow-up-right"></i> Stable from last month</span>
        </div>
        <i class="fa-solid fa-bolt metric-icon"></i>
      </article>
      <article class="manager-metric-card">
        <div>
          <p>Today's Bookings</p>
          <h3>${todayBookings}</h3>
          <span><i class="fa-solid fa-arrow-up-right"></i> Based on today records</span>
        </div>
        <i class="fa-regular fa-calendar-check metric-icon"></i>
      </article>
      <article class="manager-metric-card">
        <div>
          <p>Pending Payments</p>
          <h3>NPR ${pendingAmount}</h3>
          <span class="down"><i class="fa-solid fa-arrow-down-left"></i> Needs follow-up</span>
        </div>
        <i class="fa-regular fa-credit-card metric-icon"></i>
      </article>
    </section>

    <section class="manager-dashboard-grid">
      <article class="manager-table-panel">
        <header>
          <div>
            <h2>Recent Bookings</h2>
            <p>Latest transactions across your assigned stations.</p>
          </div>
          <a href="${pageContext.request.contextPath}/station-manager/bookings">View All <i class="fa-solid fa-angle-right"></i></a>
        </header>
        <table>
          <thead>
          <tr>
            <th>Booking ID</th>
            <th>Customer</th>
            <th>Station</th>
            <th>Status</th>
            <th>Amount</th>
            <th>Action</th>
          </tr>
          </thead>
          <tbody>
          <c:forEach var="booking" items="${recentBookings}">
            <tr>
              <td>BK-${booking.bookingId}</td>
              <td>${booking.userName}</td>
              <td>${booking.stationName}</td>
              <td>
                <span class="manager-status ${booking.bookingStatus}">${booking.bookingStatus}</span>
              </td>
              <td>NPR ${booking.amount == null ? 0 : booking.amount}</td>
              <td><a class="manager-link-btn" href="${pageContext.request.contextPath}/station-manager/booking?id=${booking.bookingId}">Details</a></td>
            </tr>
          </c:forEach>
          <c:if test="${empty recentBookings}">
            <tr><td colspan="6">No recent bookings available.</td></tr>
          </c:if>
          </tbody>
        </table>
      </article>

      <aside class="manager-right-panel">
        <article class="manager-actions-panel">
          <h2>Quick Actions</h2>
          <a href="${pageContext.request.contextPath}/station-manager/stations"><i class="fa-solid fa-location-dot"></i><span><strong>Manage Stations</strong><small>View and edit station details</small></span></a>
          <a href="${pageContext.request.contextPath}/station-manager/slots"><i class="fa-solid fa-bolt"></i><span><strong>Manage Slots</strong><small>Update charger availability</small></span></a>
          <a href="${pageContext.request.contextPath}/station-manager/bookings"><i class="fa-regular fa-bookmark"></i><span><strong>View Bookings</strong><small>Track current and past sessions</small></span></a>
          <a href="${pageContext.request.contextPath}/station-manager/reports"><i class="fa-solid fa-chart-column"></i><span><strong>Station Reports</strong><small>Analyze revenue and usage</small></span></a>
        </article>

        <article class="manager-alert-panel">
          <h3><i class="fa-solid fa-bolt"></i> Action Required</h3>
          <p>Review stations with inactive or unavailable slots and update their status before peak hours.</p>
          <a href="${pageContext.request.contextPath}/station-manager/slots">Review Slot Status</a>
        </article>
      </aside>
    </section>
  </main>
</div>
</body>
</html>
