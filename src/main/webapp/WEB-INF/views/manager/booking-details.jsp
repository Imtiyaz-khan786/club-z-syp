<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fn" uri="jakarta.tags.functions" %>
<html>
<head>
  <title>Booking Details</title>
  <link rel="stylesheet" href="${pageContext.request.contextPath}/assets/css/style.css">
</head>
<body class="manager-dashboard-page manager-booking-details-v2">
<div class="manager-shell">
  <jsp:include page="../common/manager-sidebar.jsp"/>

  <main class="manager-content">
    <a class="booking-back-link" href="${pageContext.request.contextPath}/station-manager/bookings">
      <i class="fa-solid fa-arrow-left"></i> Back to Bookings
    </a>

    <section class="booking-v2-head">
      <div>
        <h1>Booking #BK-${booking.bookingId}</h1>
        <p>Created on ${booking.bookingDate}</p>
      </div>
      <div class="booking-v2-head-right">
        <span class="booking-detail-status ${fn:toLowerCase(booking.bookingStatus)}">${booking.bookingStatus}</span>
      </div>
    </section>

    <section class="booking-v2-grid">
      <div class="booking-v2-left">
        <article class="booking-v2-card">
          <h2>Charging Details</h2>
          <div class="charging-grid">
            <div class="charging-item">
              <i class="fa-solid fa-location-dot"></i>
              <div><label>Station</label><p>${booking.stationName}</p></div>
            </div>
            <div class="charging-item">
              <i class="fa-solid fa-bolt"></i>
              <div><label>Assigned Slot</label><p>Slot ${booking.slotId}</p></div>
            </div>
            <div class="charging-item">
              <i class="fa-regular fa-calendar-days"></i>
              <div><label>Date</label><p>${fn:substring(booking.slotInfo,0,10)}</p></div>
            </div>
            <div class="charging-item">
              <i class="fa-regular fa-clock"></i>
              <div><label>Time Duration</label><p>${booking.slotInfo}</p></div>
            </div>
          </div>
        </article>

        <article class="booking-v2-card">
          <h2>Customer &amp; Vehicle</h2>
          <div class="booking-v2-split">
            <div class="booking-user-meta">
              <div class="avatar">${fn:substring(booking.userName,0,1)}</div>
              <div>
                <h3>${booking.userName}</h3>
                <p>${empty bookingUser.role ? 'User' : bookingUser.role}</p>
              </div>
            </div>
            <div class="vehicle-box">
              <label><i class="fa-solid fa-car-side"></i> Registered Vehicle</label>
              <div class="vehicle-box-inner">
                <div class="vehicle-box-head">
                  <h4>${empty booking.vehicleNumber ? 'Unknown Vehicle' : booking.vehicleNumber}</h4>
                  <span>Verified</span>
                </div>
                <div class="vehicle-box-meta">
                  <p><small>License Plate:</small> <strong>${empty booking.vehicleNumber ? '-' : booking.vehicleNumber}</strong></p>
                  <p><small>Color:</small> <strong>Daytona Grey</strong></p>
                </div>
              </div>
            </div>
          </div>
          <div class="booking-v2-split-contact">
            <p><i class="fa-solid fa-phone"></i> ${empty bookingUser.phone ? '-' : bookingUser.phone}</p>
            <p><i class="fa-regular fa-envelope"></i> ${empty bookingUser.email ? '-' : bookingUser.email}</p>
          </div>
        </article>

        <article class="booking-v2-card">
          <div class="payment-header">
            <h2>Payment Summary</h2>
            <span>${empty booking.paymentStatus ? 'pending' : booking.paymentStatus}</span>
          </div>
          <div class="payment-grid-rich">
            <div><label>Method</label><p><i class="fa-regular fa-credit-card"></i> eSewa Wallet</p></div>
            <div><label>Transaction ID</label><p>TXN-${booking.bookingId}-ES</p></div>
            <div><label>Rate</label><p>Rs. 15.00 / kWh</p></div>
            <div><label>Est. Power</label><p>~30 kWh</p></div>
          </div>
          <div class="payment-breakdown">
            <div><span>Estimated Charging Cost</span><strong>Rs. ${booking.amount == null ? 0 : booking.amount}</strong></div>
            <div><span>Booking Fee</span><strong>Rs. 25.00</strong></div>
            <div><span>Tax (13% VAT)</span><strong>Rs. 61.75</strong></div>
            <div class="total"><span>Total Paid</span><strong>Rs. ${booking.amount == null ? '536.75' : booking.amount}</strong></div>
          </div>
        </article>
      </div>

      <aside class="booking-v2-right">
        <article class="booking-v2-card">
          <h2>Manage Booking</h2>
          <div class="booking-detail-actions">
            <form method="post">
              <input type="hidden" name="action" value="bookingStatus">
              <input type="hidden" name="bookingId" value="${booking.bookingId}">
              <input type="hidden" name="status" value="completed">
              <button type="submit" class="complete"><i class="fa-solid fa-circle-check"></i> Mark as Completed</button>
            </form>
            <form method="post">
              <input type="hidden" name="action" value="bookingStatus">
              <input type="hidden" name="bookingId" value="${booking.bookingId}">
              <input type="hidden" name="status" value="confirmed">
              <button type="submit" class="confirm"><i class="fa-solid fa-check"></i> Confirm</button>
            </form>
            <form method="post">
              <input type="hidden" name="action" value="bookingStatus">
              <input type="hidden" name="bookingId" value="${booking.bookingId}">
              <input type="hidden" name="status" value="cancelled">
              <button type="submit" class="cancel"><i class="fa-solid fa-xmark"></i> Cancel Booking</button>
            </form>
          </div>
        </article>

        <article class="booking-v2-card activity-card">
          <h2>Activity Log</h2>
          <ul>
            <li class="${booking.bookingStatus == 'completed' ? 'active' : ''}"><span></span>Booking Completed</li>
            <li class="${booking.bookingStatus == 'confirmed' ? 'active' : ''}"><span></span>Booking Confirmed</li>
            <li class="${booking.bookingStatus == 'pending' ? 'active' : ''}"><span></span>Charging in Progress</li>
            <li class="${booking.bookingStatus == 'cancelled' ? 'active' : ''}"><span></span>Booking Cancelled</li>
            <li class="active"><span></span>Booking Created</li>
          </ul>
        </article>
      </aside>
    </section>
  </main>
</div>
</body>
</html>
