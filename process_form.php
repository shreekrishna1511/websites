<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Retrieve form data
    $name = $_POST["name"];
    $email = $_POST["email"];
    $message = $_POST["message"];

    // Send email (example)
    $to = "devkotakamal1514@gmail.com";
    $subject = "New Message from Website";
    $body = "Name: $name\nEmail: $email\nMessage:\n$message";
    $headers = "From: $email";

    // Uncomment the line below to send the email
     mail($to, $subject, $body, $headers);

    // Store in a database (example)
    // You need to set up your database connection here
    // $conn = new mysqli($servername, $username, $password, $dbname);
    // $sql = "INSERT INTO messages (name, email, message) VALUES ('$name', '$email', '$message')";
    // $conn->query($sql);
}
?>
