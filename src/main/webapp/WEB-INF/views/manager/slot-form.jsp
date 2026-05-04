<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fn" uri="jakarta.tags.functions" %>
<html>
<head>
  <title>${empty slot ? 'Add New Charging Slot' : 'Edit Charging Slot'}</title>
  <link rel="stylesheet" href="${pageContext.request.contextPath}/assets/css/style.css">
</head>
<body class="manager-dashboard-page manager-slot-form-page">
<div class="manager-shell">
  <jsp:include page="../common/manager-sidebar.jsp"/>

  <main class="manager-content">
    <a class="slot-back-link" href="${pageContext.request.contextPath}/station-manager/slots">
      <i class="fa-solid fa-arrow-left"></i> Back to Manage Slots
    </a>

    <c:if test="${not empty slot}">
      <section class="slot-edit-top">
        <div>
          <h2>Edit Charging Slot <span>Active Slot</span></h2>
        </div>
        <p>Slot ID: #SLT-${slot.slotId}</p>
      </section>
      <div class="slot-edit-notice">
        <i class="fa-solid fa-circle-info"></i>
        <p><strong>Notice:</strong> Editing a slot's time or date will not automatically cancel existing bookings. If you change a time slot that is already booked, you must manually notify the affected customers or cancel their bookings.</p>
      </div>
    </c:if>

    <section class="slot-form-card">
      <header class="slot-form-header">
        <h1><i class="fa-regular fa-calendar-plus"></i> ${empty slot ? 'Add New Charging Slot' : 'Slot Details'}</h1>
        <p>${empty slot ? 'Create a new time slot for customer bookings. Ensure timings do not overlap with existing slots.' : 'Update the schedule and availability for this specific charging session.'}</p>
      </header>

      <form method="post">
        <input type="hidden" name="action" value="saveSlot">
        <input type="hidden" name="slotId" value="${slot.slotId}">

        <div class="slot-form-body">
          <div class="slot-field full">
            <label>Target Station *</label>
            <select name="stationId" required>
              <option value="" disabled ${empty slot ? 'selected' : ''}>Select station</option>
              <c:forEach var="st" items="${stations}">
                <option value="${st.stationId}" ${slot.stationId == st.stationId ? 'selected' : ''}>${st.stationName}</option>
              </c:forEach>
            </select>
            <small><c:if test="${not empty slot}">Station assignment cannot be changed once a slot is created. Create a new slot instead.</c:if></small>
          </div>

          <div class="slot-field">
            <label>Slot Date *</label>
            <input type="date" name="slotDate" value="${slot.slotDate}" required>
          </div>

          <div class="slot-field">
            <label>Availability Status *</label>
            <select name="status" required>
              <option value="available" ${slot.availabilityStatus == 'available' ? 'selected' : ''}>available</option>
              <option value="booked" ${slot.availabilityStatus == 'booked' ? 'selected' : ''}>booked</option>
              <option value="inactive" ${slot.availabilityStatus == 'inactive' ? 'selected' : ''}>inactive</option>
            </select>
            <small>Slots are usually created as "available" by default.</small>
          </div>

          <div class="slot-time-card full">
            <div class="slot-field">
              <label>Start Time *</label>
              <input type="time" name="startTime" value="${fn:substring(slot.startTime,0,5)}" required>
            </div>
            <div class="slot-field">
              <label>End Time *</label>
              <input type="time" name="endTime" value="${fn:substring(slot.endTime,0,5)}" required>
            </div>
          </div>
        </div>

        <footer class="slot-form-actions">
          <a href="${pageContext.request.contextPath}/station-manager/slots">Cancel</a>
          <button type="submit"><i class="fa-regular fa-floppy-disk"></i> ${empty slot ? 'Save Slot' : 'Update Slot Details'}</button>
        </footer>
      </form>
    </section>
  </main>
</div>
</body>
</html>
