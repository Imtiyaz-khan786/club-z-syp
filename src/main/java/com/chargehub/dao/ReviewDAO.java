//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by Fernflower decompiler)
//

package com.chargehub.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.chargehub.util.DBConnection;

public class ReviewDAO {
    public List<Map<String, Object>> findAll() {
        return this.query("SELECT r.*,u.full_name, s.station_name FROM reviews r JOIN users u ON r.user_id=u.user_id JOIN stations s ON r.station_id=s.station_id ORDER BY r.review_id DESC");
    }

    public List<Map<String, Object>> findByStation(int stationId) {
        return this.query("SELECT r.*,u.full_name, s.station_name FROM reviews r JOIN users u ON r.user_id=u.user_id JOIN stations s ON r.station_id=s.station_id WHERE r.station_id=" + stationId + " AND r.status='visible' ORDER BY r.review_id DESC");
    }

    private List<Map<String, Object>> query(String sql) {
        List<Map<String, Object>> list = new ArrayList();

        try (
            Connection c = DBConnection.getConnection();
            PreparedStatement ps = c.prepareStatement(sql);
        ) {
            ResultSet rs = ps.executeQuery();
            ResultSetMetaData md = rs.getMetaData();

            while(rs.next()) {
                Map<String, Object> row = new HashMap();

                for(int i = 1; i <= md.getColumnCount(); ++i) {
                    row.put(md.getColumnLabel(i), rs.getObject(i));
                }

                list.add(row);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return list;
    }

    public boolean add(int userId, int stationId, int rating, String comment) {
        try {
            boolean var7;
            try (
                Connection c = DBConnection.getConnection();
                PreparedStatement ps = c.prepareStatement("INSERT INTO reviews(user_id,station_id,rating,comment) VALUES(?,?,?,?)");
            ) {
                ps.setInt(1, userId);
                ps.setInt(2, stationId);
                ps.setInt(3, rating);
                ps.setString(4, comment);
                var7 = ps.executeUpdate() > 0;
            }

            return var7;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean updateStatus(int id, String status) {
        try {
            boolean var5;
            try (
                Connection c = DBConnection.getConnection();
                PreparedStatement ps = c.prepareStatement("UPDATE reviews SET status=? WHERE review_id=?");
            ) {
                ps.setString(1, status);
                ps.setInt(2, id);
                var5 = ps.executeUpdate() > 0;
            }

            return var5;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean delete(int id) {
        try {
            boolean var4;
            try (
                Connection c = DBConnection.getConnection();
                PreparedStatement ps = c.prepareStatement("DELETE FROM reviews WHERE review_id=?");
            ) {
                ps.setInt(1, id);
                var4 = ps.executeUpdate() > 0;
            }

            return var4;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}
