<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fn" uri="jakarta.tags.functions" %>
<html>
<head>
  <title>Edit Assigned Station</title>
  <link rel="stylesheet" href="${pageContext.request.contextPath}/assets/css/style.css">
</head>
<body class="manager-dashboard-page manager-station-edit-page">
<div class="manager-shell">
  <jsp:include page="../common/manager-sidebar.jsp"/>

  <main class="manager-content">
    <a class="station-back-link" href="${pageContext.request.contextPath}/station-manager/stations">
      <i class="fa-solid fa-arrow-left"></i> Back to Stations
    </a>

    <section class="station-edit-card">
      <header class="station-edit-header">
        <div>
          <h1>Edit Station Details</h1>
          <p>Update information and configuration for "${station.stationName}".</p>
        </div>
        <span class="station-status-pill ${fn:toLowerCase(station.status)}">${station.status}</span>
      </header>

      <div class="station-edit-cover">
        <img src="https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?auto=format&fit=crop&w=1400&q=80" alt="EV charging station">
      </div>

      <form method="post" class="station-edit-form">
        <input type="hidden" name="action" value="saveStation">
        <input type="hidden" name="stationId" value="${station.stationId}">

        <section class="station-form-section">
          <h2><i class="fa-regular fa-circle-dot"></i> General Information</h2>
          <div class="station-form-grid">
            <div>
              <label>Station Name *</label>
              <input class="station-input" name="stationName" value="${station.stationName}" required>
            </div>
            <div>
              <label>District *</label>
              <select class="station-input" name="districtId" required>
                <c:forEach var="d" items="${districts}">
                  <option value="${d.districtId}" ${station.districtId == d.districtId ? 'selected' : ''}>${d.districtName}</option>
                </c:forEach>
              </select>
            </div>
            <div class="full">
              <label>Address *</label>
              <input class="station-input" name="address" value="${station.address}" required>
            </div>
            <div>
              <label>Contact Number *</label>
              <input class="station-input" name="contactNumber" value="${station.contactNumber}" pattern="[0-9]{10}" title="Enter a 10-digit number" required>
            </div>
          </div>
        </section>

        <section class="station-form-section">
          <h2><i class="fa-solid fa-bolt"></i> Technical Specifications</h2>
          <div class="station-form-grid">
            <div>
              <label>Primary Charger Type *</label>
              <select class="station-input" name="chargerType" required>
                <option ${station.chargerType == 'Fast Charger' ? 'selected' : ''}>Fast Charger</option>
                <option ${station.chargerType == 'DC Charger' ? 'selected' : ''}>DC Charger</option>
                <option ${station.chargerType == 'AC Charger' ? 'selected' : ''}>AC Charger</option>
                <option ${station.chargerType == 'Type 2' ? 'selected' : ''}>Type 2</option>
                <option ${station.chargerType == 'CHAdeMO' ? 'selected' : ''}>CHAdeMO</option>
                <option ${station.chargerType == 'CCS2' ? 'selected' : ''}>CCS2</option>
              </select>
            </div>
            <div>
              <label>Total Ports *</label>
              <input class="station-input" type="number" min="1" name="totalPorts" value="${station.totalPorts}" required>
            </div>
          </div>
        </section>

        <section class="station-form-section">
          <h2><i class="fa-solid fa-gear"></i> Operations &amp; Pricing</h2>
          <div class="station-form-grid">
            <div>
              <label>Opening Time *</label>
              <input class="station-input" type="time" name="openingTime" value="${fn:substring(station.openingTime,0,5)}" required>
            </div>
            <div>
              <label>Closing Time *</label>
              <input class="station-input" type="time" name="closingTime" value="${fn:substring(station.closingTime,0,5)}" required>
            </div>
            <div>
              <label>Price per Hour (NPR) *</label>
              <input class="station-input" type="number" min="0" step="0.01" name="pricePerHour" value="${station.pricePerHour}" required>
            </div>
            <div>
              <label>Status *</label>
              <select class="station-input" name="status" required>
                <option value="active" ${station.status == 'active' ? 'selected' : ''}>active</option>
                <option value="maintenance" ${station.status == 'maintenance' ? 'selected' : ''}>maintenance</option>
                <option value="inactive" ${station.status == 'inactive' ? 'selected' : ''}>inactive</option>
                <option value="offline" ${station.status == 'offline' ? 'selected' : ''}>offline</option>
              </select>
            </div>
          </div>
        </section>

        <footer class="station-edit-actions">
          <span>Last updated from current station record</span>
          <div>
            <a class="station-btn secondary" href="${pageContext.request.contextPath}/station-manager/stations">Cancel</a>
            <button class="station-btn primary" type="submit">Save Changes</button>
          </div>
        </footer>
      </form>
    </section>

    <section class="station-danger-card">
      <h3>Danger Zone</h3>
      <p>Permanently remove this station from the system. This action cannot be undone.</p>
      <form method="post" onsubmit="return confirm('Delete this station permanently?');">
        <input type="hidden" name="action" value="deleteStation">
        <input type="hidden" name="stationId" value="${station.stationId}">
        <button type="submit">Delete Station</button>
      </form>
    </section>
  </main>
</div>
</body>
</html>
