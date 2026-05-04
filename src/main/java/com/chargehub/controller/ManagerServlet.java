//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by Fernflower decompiler)
//
package com.chargehub.controller;

import com.chargehub.dao.BookingDAO;
import com.chargehub.dao.DistrictDAO;
import com.chargehub.dao.PaymentDAO;
import com.chargehub.dao.SlotDAO;
import com.chargehub.dao.StationDAO;
import com.chargehub.dao.UserDAO;
import com.chargehub.model.Booking;
import com.chargehub.model.Payment;
import com.chargehub.model.Slot;
import com.chargehub.model.Station;
import com.chargehub.model.User;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.math.BigDecimal;
import java.sql.Date;
import java.sql.Time;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet({"/station-manager/*"})
public class ManagerServlet extends HttpServlet {

    private int uid(HttpServletRequest request) {
        return (Integer) request.getSession().getAttribute("userId");
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String path = request.getPathInfo();
        if (path == null) {
            path = "/dashboard";
        }

        int managerId = this.uid(request);
        StationDAO stationDAO = new StationDAO();
        switch (path) {
            case "/dashboard":
                this.loadDashboardData(request, managerId, stationDAO);
                this.forward(request, response, "manager/dashboard.jsp");
                break;
            case "/stations":
                List<Station> stations = stationDAO.findByManager(managerId);
                request.setAttribute("stations", stations);
                if (!stations.isEmpty()) {
                    request.setAttribute("firstStationId", ((Station) stations.get(0)).getStationId());
                }

                this.forward(request, response, "manager/stations.jsp");
                break;
            case "/station-form":
                request.setAttribute("districts", (new DistrictDAO()).findAll());
                request.setAttribute("station", stationDAO.findById(Integer.parseInt(request.getParameter("id"))));
                this.forward(request, response, "manager/station-form.jsp");
                break;
            case "/slots":
                request.setAttribute("stations", stationDAO.findByManager(managerId));
                request.setAttribute("slots", (new SlotDAO()).findByManager(managerId));
                this.forward(request, response, "manager/slots.jsp");
                break;
            case "/slot-form":
                request.setAttribute("stations", stationDAO.findByManager(managerId));
                if (request.getParameter("id") != null) {
                    request.setAttribute("slot", (new SlotDAO()).findById(Integer.parseInt(request.getParameter("id"))));
                }

                this.forward(request, response, "manager/slot-form.jsp");
                break;
            case "/bookings":
                request.setAttribute("bookings", (new BookingDAO()).findByManager(managerId));
                this.forward(request, response, "manager/bookings.jsp");
                break;
            case "/booking":
                Booking booking = (new BookingDAO()).findById(Integer.parseInt(request.getParameter("id")));
                request.setAttribute("booking", booking);
                if (booking != null) {
                    User user = (new UserDAO()).findById(booking.getUserId());
                    request.setAttribute("bookingUser", user);
                }

                this.forward(request, response, "manager/booking-details.jsp");
                break;
            case "/payments":
                List<Payment> payments = (new PaymentDAO()).findByManager(managerId);
                request.setAttribute("payments", payments);
                BigDecimal paymentsTotal = BigDecimal.ZERO;
                int paidCount = 0;
                int pendingCount = 0;
                int failedCount = 0;

                for (Payment payment : payments) {
                    if (payment.getAmount() != null) {
                        paymentsTotal = paymentsTotal.add(payment.getAmount());
                    }

                    if ("paid".equalsIgnoreCase(payment.getPaymentStatus())) {
                        ++paidCount;
                    } else if ("pending".equalsIgnoreCase(payment.getPaymentStatus())) {
                        ++pendingCount;
                    } else if ("failed".equalsIgnoreCase(payment.getPaymentStatus())) {
                        ++failedCount;
                    }
                }

                request.setAttribute("paymentsTotal", paymentsTotal);
                request.setAttribute("paidCount", paidCount);
                request.setAttribute("pendingCount", pendingCount);
                request.setAttribute("failedCount", failedCount);
                this.forward(request, response, "manager/payments.jsp");
                break;
            case "/schedule":
                List<Station> managerStations = stationDAO.findByManager(managerId);
                request.setAttribute("stations", managerStations);
                int selectedStationId = 0;
                if (request.getParameter("stationId") != null && !request.getParameter("stationId").isBlank()) {
                    selectedStationId = Integer.parseInt(request.getParameter("stationId"));
                } else if (!managerStations.isEmpty()) {
                    selectedStationId = ((Station) managerStations.get(0)).getStationId();
                }

                Station selectedStation = null;

                for (Station station : managerStations) {
                    if (station.getStationId() == selectedStationId) {
                        selectedStation = station;
                        break;
                    }
                }

                request.setAttribute("selectedStation", selectedStation);
                request.setAttribute("scheduleSlots", (new SlotDAO()).findByManager(managerId));
                this.forward(request, response, "manager/schedule.jsp");
                break;
            case "/payment":
                request.setAttribute("payment", (new PaymentDAO()).findById(Integer.parseInt(request.getParameter("id"))));
                this.forward(request, response, "manager/payment-details.jsp");
                break;
            case "/reports":
                List<Booking> reportBookings = (new BookingDAO()).findByManager(managerId);
                List<Payment> reportPayments = (new PaymentDAO()).findByManager(managerId);
                List<Station> reportStations = stationDAO.findByManager(managerId);
                BigDecimal totalRevenue = BigDecimal.ZERO;

                for (Payment payment : reportPayments) {
                    if (payment.getAmount() != null) {
                        totalRevenue = totalRevenue.add(payment.getAmount());
                    }
                }

                int completedBookings = 0;
                int cancelledBookings = 0;
                int noShowBookings = 0;
                Map<String, Integer> slotUsage = new HashMap();

                for (Booking reportBooking : reportBookings) {
                    String bookingStatus = reportBooking.getBookingStatus() == null ? "" : reportBooking.getBookingStatus().toLowerCase();
                    if ("completed".equals(bookingStatus)) {
                        ++completedBookings;
                    } else if ("cancelled".equals(bookingStatus)) {
                        ++cancelledBookings;
                    } else if ("no-show".equals(bookingStatus) || "noshow".equals(bookingStatus)) {
                        ++noShowBookings;
                    }

                    String slot = reportBooking.getSlotInfo() != null && !reportBooking.getSlotInfo().isBlank() ? reportBooking.getSlotInfo() : "09:00 - 10:00";
                    slotUsage.put(slot, (Integer) slotUsage.getOrDefault(slot, 0) + 1);
                }

                String mostUsedSlot = "09:00 - 10:00";
                int mostUsedSlotCount = 0;

                for (Map.Entry<String, Integer> entry : slotUsage.entrySet()) {
                    if ((Integer) entry.getValue() > mostUsedSlotCount) {
                        mostUsedSlot = (String) entry.getKey();
                        mostUsedSlotCount = (Integer) entry.getValue();
                    }
                }

                int totalBookings = reportBookings.size();
                int completionRate = totalBookings == 0 ? 0 : completedBookings * 100 / totalBookings;
                int avgUtilization = reportStations.isEmpty() ? 0 : Math.min(100, totalBookings * 100 / (reportStations.size() * 20));
                Map<Integer, Integer> stationBookingCount = new HashMap();
                Map<Integer, BigDecimal> stationRevenue = new HashMap();
                Map<String, Integer> stationIdByName = new HashMap();

                for (Station station : reportStations) {
                    stationBookingCount.put(station.getStationId(), 0);
                    stationRevenue.put(station.getStationId(), BigDecimal.ZERO);
                    stationIdByName.put(station.getStationName(), station.getStationId());
                }

                for (Booking reportBooking : reportBookings) {
                    Integer stationId = (Integer) stationIdByName.get(reportBooking.getStationName());
                    if (stationId != null) {
                        stationBookingCount.put(stationId, (Integer) stationBookingCount.getOrDefault(stationId, 0) + 1);
                    }
                }

                for (Payment payment : reportPayments) {
                    Integer stationId = (Integer) stationIdByName.get(payment.getStationName());
                    if (stationId != null && payment.getAmount() != null) {
                        stationRevenue.put(stationId, ((BigDecimal) stationRevenue.getOrDefault(stationId, BigDecimal.ZERO)).add(payment.getAmount()));
                    }
                }

                request.setAttribute("reportBookings", reportBookings);
                request.setAttribute("reportPayments", reportPayments);
                request.setAttribute("reportStations", reportStations);
                request.setAttribute("totalRevenue", totalRevenue);
                request.setAttribute("totalBookings", totalBookings);
                request.setAttribute("completionRate", completionRate);
                request.setAttribute("avgUtilization", avgUtilization);
                request.setAttribute("completedBookings", completedBookings);
                request.setAttribute("cancelledBookings", cancelledBookings);
                request.setAttribute("noShowBookings", noShowBookings);
                request.setAttribute("mostUsedSlot", mostUsedSlot);
                request.setAttribute("mostUsedSlotCount", mostUsedSlotCount);
                request.setAttribute("stationBookingCount", stationBookingCount);
                request.setAttribute("stationRevenue", stationRevenue);
                this.forward(request, response, "manager/reports.jsp");
                break;
            default:
                response.sendRedirect(request.getContextPath() + "/station-manager/dashboard");
        }

    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String action = request.getParameter("action");
        if ("saveSlot".equals(action)) {
            Slot slot = new Slot();
            if (request.getParameter("slotId") != null && !request.getParameter("slotId").isBlank()) {
                slot.setSlotId(Integer.parseInt(request.getParameter("slotId")));
            }

            slot.setStationId(Integer.parseInt(request.getParameter("stationId")));
            slot.setSlotDate(Date.valueOf(request.getParameter("slotDate")));
            slot.setStartTime(Time.valueOf(request.getParameter("startTime") + ":00"));
            slot.setEndTime(Time.valueOf(request.getParameter("endTime") + ":00"));
            slot.setAvailabilityStatus(request.getParameter("status"));
            if (slot.getSlotId() > 0) {
                (new SlotDAO()).update(slot);
            } else {
                (new SlotDAO()).save(slot);
            }

            response.sendRedirect(request.getContextPath() + "/station-manager/slots");
        } else if ("saveStation".equals(action)) {
            int managerId = this.uid(request);
            int stationId = Integer.parseInt(request.getParameter("stationId"));
            StationDAO stationDAO = new StationDAO();
            Station existing = stationDAO.findById(stationId);
            if (existing == null || existing.getManagerId() != managerId) {
                response.sendRedirect(request.getContextPath() + "/error");
                return;
            }

            Station station = new Station();
            station.setStationId(stationId);
            station.setManagerId(managerId);
            station.setStationName(request.getParameter("stationName"));
            station.setDistrictId(Integer.parseInt(request.getParameter("districtId")));
            station.setAddress(request.getParameter("address"));
            station.setContactNumber(request.getParameter("contactNumber"));
            station.setChargerType(request.getParameter("chargerType"));
            station.setTotalPorts(Integer.parseInt(request.getParameter("totalPorts")));
            station.setOpeningTime(Time.valueOf(request.getParameter("openingTime") + ":00"));
            station.setClosingTime(Time.valueOf(request.getParameter("closingTime") + ":00"));
            station.setPricePerHour(new BigDecimal(request.getParameter("pricePerHour")));
            station.setStatus(request.getParameter("status"));
            stationDAO.update(station);
            response.sendRedirect(request.getContextPath() + "/station-manager/stations");
        } else if ("deleteStation".equals(action)) {
            int managerId = this.uid(request);
            int stationId = Integer.parseInt(request.getParameter("stationId"));
            Station station = (new StationDAO()).findById(stationId);
            if (station != null && station.getManagerId() == managerId) {
                (new StationDAO()).delete(stationId);
            }

            response.sendRedirect(request.getContextPath() + "/station-manager/stations");
        } else if ("saveSchedule".equals(action)) {
            if (request.getParameter("stationId") == null || request.getParameter("stationId").isBlank()) {
                response.sendRedirect(request.getContextPath() + "/station-manager/schedule");
                return;
            }

            int managerId = this.uid(request);
            int stationId = Integer.parseInt(request.getParameter("stationId"));
            StationDAO stationDAO = new StationDAO();
            Station existing = stationDAO.findById(stationId);
            if (existing == null || existing.getManagerId() != managerId) {
                response.sendRedirect(request.getContextPath() + "/error");
                return;
            }

            Station station = new Station();
            station.setStationId(existing.getStationId());
            station.setManagerId(existing.getManagerId());
            station.setStationName(existing.getStationName());
            station.setDistrictId(existing.getDistrictId());
            station.setAddress(existing.getAddress());
            station.setContactNumber(existing.getContactNumber());
            station.setChargerType(existing.getChargerType());
            station.setTotalPorts(existing.getTotalPorts());
            station.setPricePerHour(existing.getPricePerHour());
            station.setStatus(existing.getStatus());
            station.setOpeningTime(Time.valueOf(request.getParameter("openingTime") + ":00"));
            station.setClosingTime(Time.valueOf(request.getParameter("closingTime") + ":00"));
            stationDAO.update(station);
            String var10001 = request.getContextPath();
            response.sendRedirect(var10001 + "/station-manager/schedule?stationId=" + stationId);
        } else if ("discardSchedule".equals(action)) {
            String stationId = request.getParameter("stationId");
            String var32 = request.getContextPath();
            response.sendRedirect(var32 + "/station-manager/schedule" + (stationId == null ? "" : "?stationId=" + stationId));
        } else if ("disableSlot".equals(action)) {
            int slotId = Integer.parseInt(request.getParameter("slotId"));
            (new SlotDAO()).updateStatus(slotId, "inactive");
            response.sendRedirect(request.getContextPath() + "/station-manager/slots");
        } else if ("bulkDisableSlots".equals(action)) {
            String[] slotIds = request.getParameterValues("slotIds");
            if (slotIds != null) {
                SlotDAO slotDAO = new SlotDAO();

                for (String slotId : slotIds) {
                    slotDAO.updateStatus(Integer.parseInt(slotId), "inactive");
                }
            }

            response.sendRedirect(request.getContextPath() + "/station-manager/slots");
        } else if ("bulkDeleteSlots".equals(action)) {
            String[] slotIds = request.getParameterValues("slotIds");
            if (slotIds != null) {
                SlotDAO slotDAO = new SlotDAO();

                for (String slotId : slotIds) {
                    slotDAO.delete(Integer.parseInt(slotId));
                }
            }

            response.sendRedirect(request.getContextPath() + "/station-manager/slots");
        } else if ("deleteSlot".equals(action)) {
            (new SlotDAO()).delete(Integer.parseInt(request.getParameter("slotId")));
            response.sendRedirect(request.getContextPath() + "/station-manager/slots");
        } else if ("bookingStatus".equals(action)) {
            (new BookingDAO()).updateStatus(Integer.parseInt(request.getParameter("bookingId")), request.getParameter("status"));
            response.sendRedirect(request.getContextPath() + "/station-manager/bookings");
        } else if ("paymentStatus".equals(action)) {
            (new PaymentDAO()).updateStatus(Integer.parseInt(request.getParameter("paymentId")), request.getParameter("status"));
            response.sendRedirect(request.getContextPath() + "/station-manager/payments");
        }

    }

    private void loadDashboardData(HttpServletRequest request, int managerId, StationDAO stationDAO) {
        BookingDAO bookingDAO = new BookingDAO();
        PaymentDAO paymentDAO = new PaymentDAO();
        List<Booking> managerBookings = bookingDAO.findByManager(managerId);
        List<Payment> managerPayments = paymentDAO.findByManager(managerId);
        int totalBookings = managerBookings.size();
        int todayBookings = 0;
        LocalDate today = LocalDate.now();

        for (Booking booking : managerBookings) {
            if (booking.getBookingDate() != null && booking.getBookingDate().toLocalDateTime().toLocalDate().equals(today)) {
                ++todayBookings;
            }
        }

        BigDecimal pendingAmount = BigDecimal.ZERO;

        for (Payment payment : managerPayments) {
            if ("pending".equalsIgnoreCase(payment.getPaymentStatus()) && payment.getAmount() != null) {
                pendingAmount = pendingAmount.add(payment.getAmount());
            }
        }

        request.setAttribute("stationCount", stationDAO.findByManager(managerId).size());
        request.setAttribute("slotCount", (new SlotDAO()).countByManager(managerId));
        request.setAttribute("bookingCount", totalBookings);
        request.setAttribute("todayBookings", todayBookings);
        request.setAttribute("pendingAmount", pendingAmount);
        request.setAttribute("recentBookings", managerBookings.subList(0, Math.min(5, managerBookings.size())));
        request.setAttribute("dashboardDate", today.format(DateTimeFormatter.ofPattern("EEEE, MMM d, yyyy")));
    }

    private void forward(HttpServletRequest request, HttpServletResponse response, String page) throws ServletException, IOException {
        request.getRequestDispatcher("/WEB-INF/views/" + page).forward(request, response);
    }
}
