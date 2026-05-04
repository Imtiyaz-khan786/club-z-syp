<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fn" uri="jakarta.tags.functions" %>
<html>
<head>
  <title>Payment Details</title>
  <link rel="stylesheet" href="${pageContext.request.contextPath}/assets/css/style.css">
</head>
<body class="manager-dashboard-page manager-payment-details-exact">
<div class="manager-shell">
  <jsp:include page="../common/manager-sidebar.jsp"/>
  <main class="manager-content">
    <a class="payment-back-link" href="${pageContext.request.contextPath}/station-manager/payments"><i class="fa-solid fa-arrow-left"></i> Back to Payments</a>

    <section class="payment-details-head">
      <div>
        <h1>Payment Details</h1>
        <p>Transaction reference ${empty payment.transactionReference ? 'PAY-' : payment.transactionReference}</p>
      </div>
      <div class="payment-head-actions">
        <span class="payment-status ${fn:toLowerCase(payment.paymentStatus)}">${payment.paymentStatus}</span>
        <form method="post">
          <input type="hidden" name="action" value="paymentStatus">
          <input type="hidden" name="paymentId" value="${payment.paymentId}">
          <input type="hidden" name="status" value="failed">
          <button type="submit" class="mark-failed"><i class="fa-regular fa-circle-xmark"></i> Mark Failed</button>
        </form>
        <form method="post">
          <input type="hidden" name="action" value="paymentStatus">
          <input type="hidden" name="paymentId" value="${payment.paymentId}">
          <input type="hidden" name="status" value="paid">
          <button type="submit" class="mark-paid"><i class="fa-regular fa-circle-check"></i> Mark Paid</button>
        </form>
      </div>
    </section>

    <section class="payment-details-grid">
      <div class="payment-details-left">
        <article class="payment-detail-card">
          <h2><i class="fa-regular fa-credit-card"></i> Transaction Summary</h2>
          <div class="payment-detail-fields">
            <div><label>Transaction ID</label><p>${empty payment.transactionReference ? 'PAY-' : payment.transactionReference}</p></div>
            <div><label>Amount</label><p><strong>Rs. ${payment.amount}</strong></p></div>
            <div><label>Payment Method</label><p><i class="fa-regular fa-credit-card"></i> ${payment.paymentMethod}</p></div>
            <div><label>Gateway Reference</label><p>${empty payment.transactionReference ? '-' : payment.transactionReference}</p></div>
            <div><label>Transaction Date</label><p>${payment.paymentDate}</p></div>
            <div></div>
            <div class="full"><label>Remarks</label><p class="remarks-box">${empty payment.remarks ? '-' : payment.remarks}</p></div>
          </div>
        </article>

        <article class="payment-detail-card">
          <div class="linked-booking-header">
            <h2><i class="fa-regular fa-calendar-check"></i> Linked Booking</h2>
            <div class="linked-booking-top">
              <a href="${pageContext.request.contextPath}/station-manager/booking?id=${payment.bookingId}">View Booking <i class="fa-solid fa-arrow-up-right-from-square"></i></a>
            </div>
          </div>
          <div class="linked-booking-content">
            <div class="linked-booking-left">
              <div class="linked-item">
                <label>Booking ID</label>
                <p class="linked-id">BKG-${payment.bookingId}</p>
              </div>
              <div class="linked-item">
                <label>Station &amp; Slot</label>
                <p><i class="fa-solid fa-location-dot"></i> ${payment.stationName}</p>
                <small>Slot A (Type 2 - 22kW)</small>
              </div>
              <div class="linked-item">
                <label>Session Time</label>
                <p><i class="fa-regular fa-clock"></i> Oct 24, 2023, 12:00 - 14:00</p>
              </div>
              <div class="linked-item">
                <label>Vehicle</label>
                <p><i class="fa-solid fa-car-side"></i> Neta V (BA 1 PA 4432)</p>
              </div>
            </div>
            <div class="linked-booking-right">
              <div class="customer-pill">
                <label><i class="fa-regular fa-user"></i> Customer Details</label>
                <div class="customer-pill-main">
                  <div class="customer-avatar">
                    <img src="${pageContext.request.contextPath}/assets/images/customer-avatar.svg" alt="Customer profile image">
                  </div>
                  <div>
                    <p class="customer-name">${empty payment.userName ? 'Customer' : payment.userName}</p>
                    <p class="customer-phone">+977 9841234567</p>
                  </div>
                </div>
                <p class="customer-email">ramesh.s@example.com</p>
              </div>
            </div>
          </div>
        </article>
      </div>

      <aside class="payment-details-right">
        <article class="payment-detail-card">
          <h2><i class="fa-solid fa-wave-square"></i> Activity Log</h2>
          <ul class="payment-activity">
            <li><span></span><div><strong>Payment Initiated</strong><p>Payment request generated upon booking completion</p><small>${payment.paymentDate}</small></div></li>
            <li><span></span><div><strong>Booking Completed</strong><p>Charging session linked to this payment.</p><small>${payment.paymentDate}</small></div></li>
          </ul>
          <div class="payment-alert">
            <h4><i class="fa-solid fa-circle-exclamation"></i> Action Required</h4>
            <p>This payment is pending confirmation. Please verify the transaction with your gateway or bank and mark it accordingly.</p>
          </div>
        </article>
      </aside>
    </section>
  </main>
</div>
</body>
</html>
