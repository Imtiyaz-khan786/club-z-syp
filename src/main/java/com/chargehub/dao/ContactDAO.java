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

public class ContactDAO {
    public boolean add(String name, String email, String subject, String message) {
        try {
            boolean var7;
            try (
                Connection c = DBConnection.getConnection();
                PreparedStatement ps = c.prepareStatement("INSERT INTO contact_messages(name,email,subject,message) VALUES(?,?,?,?)");
            ) {
                ps.setString(1, name);
                ps.setString(2, email);
                ps.setString(3, subject);
                ps.setString(4, message);
                var7 = ps.executeUpdate() > 0;
            }

            return var7;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<Map<String, Object>> findAll() {
        List<Map<String, Object>> list = new ArrayList();
        String sql = "SELECT * FROM contact_messages ORDER BY message_id DESC";

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

    public boolean markRead(int id) {
        try {
            boolean var4;
            try (
                Connection c = DBConnection.getConnection();
                PreparedStatement ps = c.prepareStatement("UPDATE contact_messages SET status='read' WHERE message_id=?");
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

    public boolean delete(int id) {
        try {
            boolean var4;
            try (
                Connection c = DBConnection.getConnection();
                PreparedStatement ps = c.prepareStatement("DELETE FROM contact_messages WHERE message_id=?");
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
