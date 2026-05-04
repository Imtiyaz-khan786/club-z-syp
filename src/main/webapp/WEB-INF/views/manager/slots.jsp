<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fn" uri="jakarta.tags.functions" %>
<html>
<head>
  <title>Manage Slots</title>
  <link rel="stylesheet" href="${pageContext.request.contextPath}/assets/css/style.css">
</head>
<body class="manager-dashboard-page manager-slots-page">
<div class="manager-shell">
  <jsp:include page="../common/manager-sidebar.jsp"/>

  <main class="manager-content">
    <section class="slots-head">
      <div>
        <h1>Manage Slots</h1>
        <p>View, create, and manage charging time slots across your stations.</p>
      </div>
      <a class="slots-add-btn" href="${pageContext.request.contextPath}/station-manager/slot-form">
        <i class="fa-solid fa-plus"></i> Add New Slot
      </a>
    </section>

    <section class="slots-toolbar-card">
      <div class="slots-search">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input id="slotSearch" type="text" placeholder="Search slots or stations...">
      </div>
      <input id="dateFilter" class="slots-date" type="date">
      <select id="statusFilter">
        <option value="">All Status</option>
        <option value="available">Available</option>
        <option value="booked">Booked</option>
        <option value="inactive">Disabled</option>
      </select>
      <div class="slots-bulk-actions" id="bulkActions">
        <span><strong id="selectedCount">0</strong> selected</span>
        <button type="button" id="bulkDisableBtn"><i class="fa-solid fa-ban"></i> Disable</button>
        <button type="button" id="bulkDeleteBtn" class="danger"><i class="fa-regular fa-trash-can"></i> Delete</button>
      </div>
    </section>

    <section class="slots-table-card">
      <table>
        <thead>
        <tr>
          <th><input id="selectAllSlots" type="checkbox"></th>
          <th>Slot Date</th>
          <th>Start Time</th>
          <th>End Time</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
        </thead>
        <tbody id="slotsTableBody">
        <c:forEach var="slot" items="${slots}">
          <tr
            data-search="${fn:toLowerCase(slot.stationName)} ${slot.slotDate} ${slot.startTime} ${slot.endTime}"
            data-date="${slot.slotDate}"
            data-status="${fn:toLowerCase(slot.availabilityStatus)}">
            <td><input class="slot-checkbox" type="checkbox" value="${slot.slotId}"></td>
            <td>
              <div class="slot-main">${slot.slotDate}</div>
              <div class="slot-sub">SLT-${slot.slotId}</div>
            </td>
            <td>${fn:substring(slot.startTime,0,5)}</td>
            <td>${fn:substring(slot.endTime,0,5)}</td>
            <td><span class="slot-status ${fn:toLowerCase(slot.availabilityStatus)}">${slot.availabilityStatus}</span></td>
            <td>
              <div class="slot-actions">
                <a href="${pageContext.request.contextPath}/station-manager/slot-form?id=${slot.slotId}" title="Edit Slot"><i class="fa-solid fa-pen-to-square"></i></a>
                <form method="post">
                  <input type="hidden" name="action" value="disableSlot">
                  <input type="hidden" name="slotId" value="${slot.slotId}">
                  <button type="submit" title="Disable Slot"><i class="fa-solid fa-ban"></i></button>
                </form>
                <form method="post" onsubmit="return confirm('Delete this slot?');">
                  <input type="hidden" name="action" value="deleteSlot">
                  <input type="hidden" name="slotId" value="${slot.slotId}">
                  <button type="submit" class="danger" title="Delete Slot"><i class="fa-regular fa-trash-can"></i></button>
                </form>
              </div>
            </td>
          </tr>
        </c:forEach>
        <tr id="noSlotRows" style="display:none"><td colspan="6">No slots match your filters.</td></tr>
        </tbody>
      </table>

      <div class="slots-footer">
        <p>Showing <span id="showingSlots">${fn:length(slots)}</span> of <strong>${fn:length(slots)}</strong> entries</p>
      </div>
    </section>

    <form id="bulkDisableForm" method="post" style="display:none;">
      <input type="hidden" name="action" value="bulkDisableSlots">
    </form>
    <form id="bulkDeleteForm" method="post" style="display:none;">
      <input type="hidden" name="action" value="bulkDeleteSlots">
    </form>
  </main>
</div>

<script>
  (function () {
    const rows = Array.from(document.querySelectorAll("#slotsTableBody tr[data-search]"));
    const searchInput = document.getElementById("slotSearch");
    const dateFilter = document.getElementById("dateFilter");
    const statusFilter = document.getElementById("statusFilter");
    const noRows = document.getElementById("noSlotRows");
    const showingSlots = document.getElementById("showingSlots");
    const selectAll = document.getElementById("selectAllSlots");
    const checkboxes = Array.from(document.querySelectorAll(".slot-checkbox"));
    const selectedCount = document.getElementById("selectedCount");
    const bulkActions = document.getElementById("bulkActions");
    const bulkDisableBtn = document.getElementById("bulkDisableBtn");
    const bulkDeleteBtn = document.getElementById("bulkDeleteBtn");
    const bulkDisableForm = document.getElementById("bulkDisableForm");
    const bulkDeleteForm = document.getElementById("bulkDeleteForm");

    function applyFilters() {
      const search = searchInput.value.trim().toLowerCase();
      const date = dateFilter.value.trim();
      const status = statusFilter.value.trim().toLowerCase();
      let visible = 0;
      rows.forEach((row) => {
        const rowSearch = row.dataset.search || "";
        const rowDate = row.dataset.date || "";
        const rowStatus = row.dataset.status || "";
        const okSearch = !search || rowSearch.includes(search);
        const okDate = !date || rowDate === date;
        const okStatus = !status || rowStatus === status;
        const show = okSearch && okDate && okStatus;
        row.style.display = show ? "" : "none";
        if (show) visible++;
      });
      showingSlots.textContent = String(visible);
      noRows.style.display = visible === 0 ? "" : "none";
      updateSelectedCount();
    }

    function updateSelectedCount() {
      const visibleChecked = rows.filter((row) => row.style.display !== "none")
        .map((row) => row.querySelector(".slot-checkbox"))
        .filter((cb) => cb && cb.checked);
      selectedCount.textContent = String(visibleChecked.length);
      bulkActions.classList.toggle("has-selection", visibleChecked.length > 0);
    }

    function addHiddenIds(form, ids) {
      Array.from(form.querySelectorAll('input[name="slotIds"]')).forEach((el) => el.remove());
      ids.forEach((id) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = "slotIds";
        input.value = id;
        form.appendChild(input);
      });
    }

    function getSelectedVisibleIds() {
      return rows
        .filter((row) => row.style.display !== "none")
        .map((row) => row.querySelector(".slot-checkbox"))
        .filter((cb) => cb && cb.checked)
        .map((cb) => cb.value);
    }

    searchInput.addEventListener("input", applyFilters);
    dateFilter.addEventListener("change", applyFilters);
    statusFilter.addEventListener("change", applyFilters);
    selectAll.addEventListener("change", function () {
      rows.forEach((row) => {
        if (row.style.display !== "none") {
          const cb = row.querySelector(".slot-checkbox");
          if (cb) cb.checked = selectAll.checked;
        }
      });
      updateSelectedCount();
    });
    checkboxes.forEach((cb) => cb.addEventListener("change", updateSelectedCount));

    bulkDisableBtn.addEventListener("click", function () {
      const ids = getSelectedVisibleIds();
      if (!ids.length) return;
      addHiddenIds(bulkDisableForm, ids);
      bulkDisableForm.submit();
    });

    bulkDeleteBtn.addEventListener("click", function () {
      const ids = getSelectedVisibleIds();
      if (!ids.length) return;
      if (!confirm("Delete selected slots?")) return;
      addHiddenIds(bulkDeleteForm, ids);
      bulkDeleteForm.submit();
    });

    applyFilters();
  })();
</script>
</body>
</html>
