package com.chargehub.util;

import java.sql.Connection;
import java.sql.DriverManager;

/**
 * Utility class for establishing connections to the ChargeHub Nepal MySQL database.
 *
 * <p>Provides a single static factory method to obtain a new {@link Connection}
 * instance using the JDBC MySQL driver. This class is not intended to be instantiated.</p>
 *
 * <p><strong>Security Warning:</strong> Database credentials are currently hardcoded
 * as static constants. For production deployments, credentials should be externalized
 * to environment variables, a properties file, or a secrets manager to avoid
 * exposing sensitive information in source control.</p>
 *
 * <p><strong>Note:</strong> This class does not implement connection pooling.
 * Each call to {@link #getConnection()} opens a new physical connection to the database.
 * For production use, consider replacing this with a pooled data source
 * such as HikariCP or Apache DBCP to improve performance and resource management.</p>
 */
public class DBConnection {

    /**
     * JDBC connection URL pointing to the local MySQL instance and the
     * {@code chargehub_nepal} database schema.
     */
    private static final String URL = "jdbc:mysql://localhost:3306/chargehub_nepal";

    /**
     * MySQL database username used to authenticate the connection.
     *
     * <p><strong>Security Warning:</strong> This value should not be hardcoded
     * in production. Externalize to an environment variable or configuration file.</p>
     */
    private static final String USER = "root";

    /**
     * MySQL database password used to authenticate the connection.
     *
     * <p><strong>Security Warning:</strong> Storing passwords in source code is a
     * security risk. This value must be externalized before deploying to any
     * non-development environment.</p>
     */
    private static final String PASSWORD = "minma2004";

    /**
     * Private constructor to prevent instantiation of this utility class.
     *
     * <p>All members of this class are static. This class should never
     * be instantiated directly.</p>
     */
    private DBConnection() {}

    /**
     * Creates and returns a new {@link Connection} to the ChargeHub Nepal database.
     *
     * <p>Loads the MySQL JDBC driver ({@code com.mysql.cj.jdbc.Driver}) via
     * {@link Class#forName(String)} on each invocation and opens a fresh
     * physical connection using {@link DriverManager#getConnection(String, String, String)}.</p>
     *
     * <p><strong>Important:</strong> This method returns a raw, unpooled connection.
     * Callers are responsible for closing the connection after use, ideally via
     * try-with-resources, to prevent connection leaks:</p>
     *
     * <pre>{@code
     * try (Connection c = DBConnection.getConnection();
     *      PreparedStatement ps = c.prepareStatement(sql)) {
     *     // use ps
     * }
     * }</pre>
     *
     * <p>If the connection attempt fails (e.g., the database is unreachable or
     * credentials are invalid), the exception is printed to stderr and
     * {@code null} is returned. Callers should null-check the returned value
     * if not using try-with-resources.</p>
     *
     * @return a new {@link Connection} instance if the connection succeeds;
     *         {@code null} if an error occurs during driver loading or connection establishment
     */
    public static Connection getConnection() {
        Connection conn = null;
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            conn = DriverManager.getConnection(URL, USER, PASSWORD);
            System.out.println("Database Connected Successfully!");
        } catch (Exception e) {
            e.printStackTrace();
        }
        return conn;
    }
}