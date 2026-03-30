using System;
using System.Drawing;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Windows.Forms;
using Newtonsoft.Json;

namespace ABGSM
{
    public partial class FormUsers : Form
    {
        private readonly string token;

        private ListBox listBoxUsers;
        private ListBox listBoxCart;
        private ListBox listBoxOrders;

        private Button btnLoadUsers;
        private Button btnLoadCart;
        private Button btnLoadOrders;
        private Button btnRefreshAll;

        private Label lblUsers;
        private Label lblCart;
        private Label lblOrders;

        public FormUsers(string jwt)
        {
            token = jwt;
            InitializeUi();
            Load += FormUsers_Load;
        }

        private void InitializeUi()
        {
            Text = "Felhasználók / Kosarak / Rendelések";
            StartPosition = FormStartPosition.CenterScreen;
            Size = new Size(1250, 700);
            MinimumSize = new Size(1100, 600);
            BackColor = Color.FromArgb(245, 245, 245);

            Font headerFont = new Font("Segoe UI", 11, FontStyle.Bold);
            Font normalFont = new Font("Segoe UI", 10, FontStyle.Regular);

            lblUsers = new Label
            {
                Text = "Felhasználók",
                Font = headerFont,
                AutoSize = true,
                Location = new Point(20, 20)
            };

            lblCart = new Label
            {
                Text = "Kiválasztott user kosara",
                Font = headerFont,
                AutoSize = true,
                Location = new Point(420, 20)
            };

            lblOrders = new Label
            {
                Text = "Kiválasztott user rendelései",
                Font = headerFont,
                AutoSize = true,
                Location = new Point(820, 20)
            };

            listBoxUsers = new ListBox
            {
                Font = normalFont,
                Location = new Point(20, 55),
                Size = new Size(350, 520),
                Anchor = AnchorStyles.Top | AnchorStyles.Bottom | AnchorStyles.Left
            };
            listBoxUsers.SelectedIndexChanged += ListBoxUsers_SelectedIndexChanged;

            listBoxCart = new ListBox
            {
                Font = normalFont,
                Location = new Point(420, 55),
                Size = new Size(350, 520),
                Anchor = AnchorStyles.Top | AnchorStyles.Bottom | AnchorStyles.Left,
                HorizontalScrollbar = true
            };

            listBoxOrders = new ListBox
            {
                Font = normalFont,
                Location = new Point(820, 55),
                Size = new Size(390, 520),
                Anchor = AnchorStyles.Top | AnchorStyles.Bottom | AnchorStyles.Left | AnchorStyles.Right,
                HorizontalScrollbar = true
            };

            btnLoadUsers = new Button
            {
                Text = "Userek betöltése",
                Font = normalFont,
                Size = new Size(160, 40),
                Location = new Point(20, 600),
                Anchor = AnchorStyles.Bottom | AnchorStyles.Left
            };
            btnLoadUsers.Click += BtnLoadUsers_Click;

            btnLoadCart = new Button
            {
                Text = "Kosár lekérése",
                Font = normalFont,
                Size = new Size(160, 40),
                Location = new Point(420, 600),
                Anchor = AnchorStyles.Bottom | AnchorStyles.Left
            };
            btnLoadCart.Click += BtnLoadCart_Click;

            btnLoadOrders = new Button
            {
                Text = "Rendelések lekérése",
                Font = normalFont,
                Size = new Size(180, 40),
                Location = new Point(820, 600),
                Anchor = AnchorStyles.Bottom | AnchorStyles.Left
            };
            btnLoadOrders.Click += BtnLoadOrders_Click;

            btnRefreshAll = new Button
            {
                Text = "Minden frissítése",
                Font = normalFont,
                Size = new Size(160, 40),
                Location = new Point(1050, 600),
                Anchor = AnchorStyles.Bottom | AnchorStyles.Right
            };
            btnRefreshAll.Click += BtnRefreshAll_Click;

            Controls.Add(lblUsers);
            Controls.Add(lblCart);
            Controls.Add(lblOrders);

            Controls.Add(listBoxUsers);
            Controls.Add(listBoxCart);
            Controls.Add(listBoxOrders);

            Controls.Add(btnLoadUsers);
            Controls.Add(btnLoadCart);
            Controls.Add(btnLoadOrders);
            Controls.Add(btnRefreshAll);
        }

        private async void FormUsers_Load(object sender, EventArgs e)
        {
            await LoadUsersAsync();
        }

        private async void BtnLoadUsers_Click(object sender, EventArgs e)
        {
            await LoadUsersAsync();
        }

        private async void BtnLoadCart_Click(object sender, EventArgs e)
        {
            await LoadSelectedUserCartAsync();
        }

        private async void BtnLoadOrders_Click(object sender, EventArgs e)
        {
            await LoadSelectedUserOrdersAsync();
        }

        private async void BtnRefreshAll_Click(object sender, EventArgs e)
        {
            int selectedUserId = GetSelectedUserID();

            await LoadUsersAsync();

            if (selectedUserId > 0)
            {
                SelectUserById(selectedUserId);
                await LoadSelectedUserCartAsync();
                await LoadSelectedUserOrdersAsync();
            }
        }

        private async void ListBoxUsers_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (GetSelectedUserID() <= 0)
                return;

            await LoadSelectedUserCartAsync();
            await LoadSelectedUserOrdersAsync();
        }

        private async Task LoadUsersAsync()
        {
            try
            {
                listBoxUsers.Items.Clear();
                listBoxCart.Items.Clear();
                listBoxOrders.Items.Clear();

                using (HttpClient client = CreateHttpClient())
                {
                    HttpResponseMessage response = await client.GetAsync("http://localhost:3001/api/admin/users");
                    string responseBody = await response.Content.ReadAsStringAsync();

                    if (!response.IsSuccessStatusCode)
                    {
                        MessageBox.Show("Nem sikerült lekérni a usereket.\n" + responseBody);
                        return;
                    }

                    AdminUsersResponse result = JsonConvert.DeserializeObject<AdminUsersResponse>(responseBody);

                    if (result == null || !result.success || result.data == null)
                    {
                        MessageBox.Show("Hibás válasz érkezett a szervertől a userek lekérésénél.");
                        return;
                    }

                    foreach (AdminUserDto user in result.data)
                    {
                        listBoxUsers.Items.Add(user);
                    }

                    if (listBoxUsers.Items.Count == 0)
                    {
                        listBoxUsers.Items.Add("Nincs felhasználó.");
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Hiba a userek betöltése közben:\n" + ex.Message);
            }
        }

        private async Task LoadSelectedUserCartAsync()
        {
            int userID = GetSelectedUserID();
            if (userID <= 0)
            {
                listBoxCart.Items.Clear();
                listBoxCart.Items.Add("Válassz ki egy felhasználót.");
                return;
            }

            try
            {
                listBoxCart.Items.Clear();

                using (HttpClient client = CreateHttpClient())
                {
                    HttpResponseMessage response = await client.GetAsync($"http://localhost:3001/api/admin/user/{userID}/cart");
                    string responseBody = await response.Content.ReadAsStringAsync();

                    if (!response.IsSuccessStatusCode)
                    {
                        MessageBox.Show("Nem sikerült lekérni a kosarat.\n" + responseBody);
                        return;
                    }

                    AdminCartResponse result = JsonConvert.DeserializeObject<AdminCartResponse>(responseBody);

                    if (result == null || !result.success)
                    {
                        MessageBox.Show("Hibás válasz érkezett a szervertől a kosár lekérésénél.");
                        return;
                    }

                    if (result.data == null || result.data.Length == 0)
                    {
                        listBoxCart.Items.Add("A kosár üres.");
                        return;
                    }

                    int vegosszeg = 0;

                    foreach (AdminCartItemDto item in result.data)
                    {
                        int total = item.ar * item.darab;
                        vegosszeg += total;

                        listBoxCart.Items.Add(
                            $"{item.nev} | {item.darab} db | {item.ar} Ft/db | Összesen: {total} Ft"
                        );
                    }

                    listBoxCart.Items.Add("----------------------------------------");
                    listBoxCart.Items.Add($"Kosár végösszeg: {vegosszeg} Ft");
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Hiba a kosár betöltése közben:\n" + ex.Message);
            }
        }

        private async Task LoadSelectedUserOrdersAsync()
        {
            int userID = GetSelectedUserID();
            if (userID <= 0)
            {
                listBoxOrders.Items.Clear();
                listBoxOrders.Items.Add("Válassz ki egy felhasználót.");
                return;
            }

            try
            {
                listBoxOrders.Items.Clear();

                using (HttpClient client = CreateHttpClient())
                {
                    HttpResponseMessage response = await client.GetAsync($"http://localhost:3001/api/admin/user/{userID}/orders");
                    string responseBody = await response.Content.ReadAsStringAsync();

                    if (!response.IsSuccessStatusCode)
                    {
                        MessageBox.Show("Nem sikerült lekérni a rendeléseket.\n" + responseBody);
                        return;
                    }

                    AdminOrdersResponse result = JsonConvert.DeserializeObject<AdminOrdersResponse>(responseBody);

                    if (result == null || !result.success)
                    {
                        MessageBox.Show("Hibás válasz érkezett a szervertől a rendelések lekérésénél.");
                        return;
                    }

                    if (result.data == null || result.data.Length == 0)
                    {
                        listBoxOrders.Items.Add("Nincs rendelés.");
                        return;
                    }

                    foreach (AdminOrderDto order in result.data)
                    {
                        listBoxOrders.Items.Add(
                            $"Rendelés #{order.orderID} | Dátum: {order.datum:yyyy-MM-dd HH:mm} | Állapot: {order.allapot} | Összeg: {order.osszeg} Ft"
                        );
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Hiba a rendelések betöltése közben:\n" + ex.Message);
            }
        }

        private HttpClient CreateHttpClient()
        {
            HttpClient client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            return client;
        }

        private int GetSelectedUserID()
        {
            if (listBoxUsers.SelectedItem is AdminUserDto selectedUser)
                return selectedUser.userID;

            return -1;
        }

        private void SelectUserById(int userId)
        {
            for (int i = 0; i < listBoxUsers.Items.Count; i++)
            {
                if (listBoxUsers.Items[i] is AdminUserDto user && user.userID == userId)
                {
                    listBoxUsers.SelectedIndex = i;
                    return;
                }
            }
        }
    }

    public class AdminUsersResponse
    {
        public bool success { get; set; }
        public AdminUserDto[] data { get; set; }
    }

    public class AdminCartResponse
    {
        public bool success { get; set; }
        public AdminCartItemDto[] data { get; set; }
    }

    public class AdminOrdersResponse
    {
        public bool success { get; set; }
        public AdminOrderDto[] data { get; set; }
    }

    public class AdminUserDto
    {
        public int userID { get; set; }
        public string nev { get; set; }
        public string email { get; set; }
        public string status { get; set; }

        public override string ToString()
        {
            return $"{userID} | {nev} | {email} | {status}";
        }
    }

    public class AdminCartItemDto
    {
        public int pID { get; set; }
        public string nev { get; set; }
        public int ar { get; set; }
        public int darab { get; set; }
    }

    public class AdminOrderDto
    {
        public int orderID { get; set; }
        public DateTime datum { get; set; }
        public string allapot { get; set; }
        public int osszeg { get; set; }
    }
}