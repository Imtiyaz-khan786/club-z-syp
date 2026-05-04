<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fn" uri="jakarta.tags.functions" %>
<html>
<head>
  <title>Manage Payments</title>
  <link rel="stylesheet" href="${pageContext.request.contextPath}/assets/css/style.css">
</head>
<body class="manager-dashboard-page manager-payments-page">
<div class="manager-shell">
  <jsp:include page="../common/manager-sidebar.jsp"/>

  <main class="manager-content">
    <section class="payments-head">
      <div>
        <h1>Manage Payments</h1>
        <p>Track, reconcile, and manage all financial transactions across your stations.</p>
      </div>
    </section>

    <section class="payments-summary">
      <article class="payment-stat">
        <div class="payment-stat-top"><p>Total Revenue</p><span><i class="fa-regular fa-credit-card"></i></span></div>
        <h3>NPR ${paymentsTotal}</h3>
      </article>
      <article class="payment-stat">
        <div class="payment-stat-top"><p>Paid Payments</p><span><i class="fa-regular fa-circle-check"></i></span></div>
        <h3>${paidCount}</h3>
      </article>
      <article class="payment-stat">
        <div class="payment-stat-top"><p>Pending</p><span><i class="fa-regular fa-clock"></i></span></div>
        <h3>${pendingCount}</h3>
      </article>
      <article class="payment-stat">
        <div class="payment-stat-top"><p>Failed</p><span><i class="fa-regular fa-circle-xmark"></i></span></div>
        <h3>${failedCount}</h3>
      </article>
    </section>

    <section class="payments-filter-card">
      <div class="payments-search">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input id="paymentSearch" type="text" placeholder="Search payment or booking ID...">
      </div>
      <div class="payments-status-tabs" id="paymentStatusTabs">
        <button type="button" class="active" data-status="">All</button>
        <button type="button" data-status="paid">Completed</button>
        <button type="button" data-status="pending">Pending</button>
        <button type="button" data-status="failed">Failed</button>
      </div>
      <div class="payments-filter-divider"></div>
      <button type="button" class="payments-filter-btn" id="togglePaymentFilters">
        <i class="fa-solid fa-filter"></i> Filters <i class="fa-solid fa-angle-down"></i>
      </button>
    </section>

    <section class="payments-advanced-filters" id="paymentAdvancedFilters" style="display:none;">
      <input id="paymentDateFilter" type="date">
      <select id="paymentMethodFilter">
        <option value="">All Methods</option>
        <c:forEach var="p" items="${payments}">
          <option value="${fn:toLowerCase(p.paymentMethod)}">${p.paymentMethod}</option>
        </c:forEach>
      </select>
    </section>

    <section class="payments-table-card">
      <table>
        <thead>
        <tr>
          <th>Payment ID</th>
          <th>Booking ID</th>
          <th>User</th>
          <th>Amount</th>
          <th>Method</th>
          <th>Payment Status</th>
          <th>Action</th>
        </tr>
        </thead>
        <tbody id="paymentsTableBody">
        <c:forEach var="p" items="${payments}">
          <tr
            data-search="pay-${p.paymentId} bkg-${p.bookingId} ${fn:toLowerCase(p.userName)}"
            data-date="${fn:substring(p.paymentDate,0,10)}"
            data-method="${fn:toLowerCase(p.paymentMethod)}"
            data-status="${fn:toLowerCase(p.paymentStatus)}">
            <td>
              <strong>PAY-${p.paymentId}</strong>
              <div class="payment-sub">${p.paymentDate}</div>
            </td>
            <td>BKG-${p.bookingId}</td>
            <td>${p.userName}</td>
            <td>NPR ${p.amount}</td>
            <td>${p.paymentMethod}</td>
            <td><span class="payment-status ${fn:toLowerCase(p.paymentStatus)}">${p.paymentStatus}</span></td>
            <td>
              <div class="payment-actions">
                <a href="${pageContext.request.contextPath}/station-manager/payment?id=${p.paymentId}" title="View Details"><i class="fa-regular fa-eye"></i></a>
                <form method="post">
                  <input type="hidden" name="action" value="paymentStatus">
                  <input type="hidden" name="paymentId" value="${p.paymentId}">
                  <input type="hidden" name="status" value="paid">
                  <button type="submit" class="success" title="Mark Paid"><i class="fa-solid fa-check"></i></button>
                </form>
                <form method="post">
                  <input type="hidden" name="action" value="paymentStatus">
                  <input type="hidden" name="paymentId" value="${p.paymentId}">
                  <input type="hidden" name="status" value="failed">
                  <button type="submit" class="danger" title="Mark Failed"><i class="fa-solid fa-xmark"></i></button>
                </form>
                <form method="post" class="payment-update-form">
                  <input type="hidden" name="action" value="paymentStatus">
                  <input type="hidden" name="paymentId" value="${p.paymentId}">
                  <select name="status">
                    <option value="paid">paid</option>
                    <option value="pending">pending</option>
                    <option value="failed">failed</option>
                    <option value="refunded">refunded</option>
                  </select>
                  <button type="submit" title="Update Status"><i class="fa-solid fa-rotate"></i></button>
                </form>
              </div>
            </td>
          </tr>
        </c:forEach>
        <tr id="noPaymentRows" style="display:none"><td colspan="7">No payments match your filters.</td></tr>
        </tbody>
      </table>
      <div class="payments-footer">
        <p>Showing <span id="showingPayments">${fn:length(payments)}</span> of <strong>${fn:length(payments)}</strong> payments</p>
      </div>
    </section>
  </main>
</div>

<script>
  (function () {
    const rows = Array.from(document.querySelectorAll("#paymentsTableBody tr[data-search]"));
    const searchInput = document.getElementById("paymentSearch");
    const dateFilter = document.getElementById("paymentDateFilter");
    const methodFilter = document.getElementById("paymentMethodFilter");
    const statusTabs = Array.from(document.querySelectorAll("#paymentStatusTabs button"));
    const toggleFilters = document.getElementById("togglePaymentFilters");
    const advancedFilters = document.getElementById("paymentAdvancedFilters");
    const noRows = document.getElementById("noPaymentRows");
    const showing = document.getElementById("showingPayments");
    let activeStatus = "";

    function applyFilters() {
      const search = searchInput.value.trim().toLowerCase();
      const date = dateFilter.value.trim();
      const method = methodFilter.value.trim().toLowerCase();
      const status = activeStatus;
      let visible = 0;

      rows.forEach((row) => {
        const rowSearch = row.dataset.search || "";
        const rowDate = row.dataset.date || "";
        const rowMethod = row.dataset.method || "";
        const rowStatus = row.dataset.status || "";
        const show =
          (!search || rowSearch.includes(search)) &&
          (!date || rowDate === date) &&
          (!method || rowMethod === method) &&
          (!status || rowStatus === status);
        row.style.display = show ? "" : "none";
        if (show) visible++;
      });

      showing.textContent = String(visible);
      noRows.style.display = visible === 0 ? "" : "none";
    }

    searchInput.addEventListener("input", applyFilters);
    dateFilter.addEventListener("change", applyFilters);
    methodFilter.addEventListener("change", applyFilters);
    statusTabs.forEach((btn) => {
      btn.addEventListener("click", function () {
        statusTabs.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activeStatus = (btn.dataset.status || "").trim().toLowerCase();
        applyFilters();
      });
    });
    toggleFilters.addEventListener("click", function () {
      const open = advancedFilters.style.display !== "none";
      advancedFilters.style.display = open ? "none" : "grid";
    });
    applyFilters();
  })();
</script>
</body>
</html>
