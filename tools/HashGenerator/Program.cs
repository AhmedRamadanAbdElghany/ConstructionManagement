using BCrypt.Net;

string password = "admin";
string hash = BCrypt.Net.BCrypt.HashPassword(password);
Console.WriteLine($"Hash for '{password}': {hash}");
