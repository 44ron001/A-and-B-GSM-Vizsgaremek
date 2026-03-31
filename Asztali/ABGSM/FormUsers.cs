using System;
using System.Drawing;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
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
        private ListBox listBoxOrderItems;

        private Button btnLoadUsers;
        private Button btnLoadCart;
        private Button btnLoadOrders;
        private Button btnRefreshAll;
        private Button btnUpdateOrderStatus;
        private Button btnShipOrder;

        private Label lblUsers;
        private Label lblCart;
        private Label lblOrders;
        private Label lblOrderItems;
        private Label lblStatus;

        private ComboBox comboOrderStatus;

        private Timer autoRefreshTimer;
        private bool isRefreshing = false;
        private bool suppressUserSelectionChanged = false;
        private bool suppressOrderSelectionChanged = false;

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
            Size = new Size(1600, 760);
            MinimumSize = new Size(1400, 650);
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
                Location = new Point(330, 20)
            };

            lblOrders = new Label
            {
                Text = "Kiválasztott user rendelései",
                Font = headerFont,
                AutoSize = true,
                Location = new Point(670, 20)
            };

            lblOrderItems = new Label
            {
                Text = "Kiválasztott rendelés termékei",
                Font = headerFont,
                AutoSize = true,
                Location = new Point(1040, 20)
            };

            listBoxUsers = new ListBox
            {
                Font = normalFont,
                Location = new Point(20, 55),
                Size = new Size(280, 540),
                Anchor = AnchorStyles.Top | AnchorStyles.Bottom | AnchorStyles.Left
            };
            listBoxUsers.SelectedIndexChanged += ListBoxUsers_SelectedIndexChanged;

            listBoxCart = new ListBox
            {
                Font = normalFont,
                Location = new Point(330, 55),
                Size = new Size(310, 540),
                Anchor = AnchorStyles.Top | AnchorStyles.Bottom | AnchorStyles.Left,
                HorizontalScrollbar = true
            };

            listBoxOrders = new ListBox
            {
                Font = normalFont,
                Location = new Point(670, 55),
                Size = new Size(340, 540),
                Anchor = AnchorStyles.Top | AnchorStyles.Bottom | AnchorStyles.Left,
                HorizontalScrollbar = true
            };
            listBoxOrders.SelectedIndexChanged += ListBoxOrders_SelectedIndexChanged;

            listBoxOrderItems = new ListBox
            {
                Font = normalFont,
                Location = new Point(1040, 55),
                Size = new Size(520, 540),
                Anchor = AnchorStyles.Top | AnchorStyles.Bottom | AnchorStyles.Left | AnchorStyles.Right,
                HorizontalScrollbar = true
            };

            btnLoadUsers = new Button
            {
                Text = "Userek betöltése",
                Font = normalFont,
                Size = new Size(160, 40),
                Location = new Point(20, 620),
                Anchor = AnchorStyles.Bottom | AnchorStyles.Left
            };
            btnLoadUsers.Click += BtnLoadUsers_Click;

            btnLoadCart = new Button
            {
                Text = "Kosár lekérése",
                Font = normalFont,
                Size = new Size(160, 40),
                Location = new Point(330, 620),
                Anchor = AnchorStyles.Bottom | AnchorStyles.Left
            };
            btnLoadCart.Click += BtnLoadCart_Click;

            btnLoadOrders = new Button
            {
                Text = "Rendelések lekérése",
                Font = normalFont,
                Size = new Size(180, 40),
                Location = new Point(670, 620),
                Anchor = AnchorStyles.Bottom | AnchorStyles.Left
            };
            btnLoadOrders.Click += BtnLoadOrders_Click;

            btnRefreshAll = new Button
            {
                Text = "Minden frissítése",
                Font = normalFont,
                Size = new Size(160, 40),
                Location = new Point(1400, 670),
                Anchor = AnchorStyles.Bottom | AnchorStyles.Right
            };
            btnRefreshAll.Click += BtnRefreshAll_Click;

            lblStatus = new Label
            {
                Text = "Rendelés állapot:",
                Font = normalFont,
                AutoSize = true,
                Location = new Point(1040, 610),
                Anchor = AnchorStyles.Bottom | AnchorStyles.Left
            };

            comboOrderStatus = new ComboBox
            {
                Font = normalFont,
                DropDownStyle = ComboBoxStyle.DropDownList,
                Location = new Point(1165, 607),
                Size = new Size(180, 30),
                Anchor = AnchorStyles.Bottom | AnchorStyles.Left
            };

            comboOrderStatus.Items.Add("Feldolgozás alatt");
            comboOrderStatus.Items.Add("Fizetésre vár");
            comboOrderStatus.Items.Add("Csomagolás alatt");
            comboOrderStatus.Items.Add("Átadva futárnak");
            comboOrderStatus.Items.Add("Kiszállítva");
            comboOrderStatus.Items.Add("Törölve");

            btnUpdateOrderStatus = new Button
            {
                Text = "Állapot mentése",
                Font = normalFont,
                Size = new Size(150, 40),
                Location = new Point(1360, 600),
                Anchor = AnchorStyles.Bottom | AnchorStyles.Right
            };
            btnUpdateOrderStatus.Click += BtnUpdateOrderStatus_Click;

            btnShipOrder = new Button
            {
                Text = "Kiküldés",
                Font = normalFont,
                Size = new Size(120, 40),
                Location = new Point(1230, 650),
                Anchor = AnchorStyles.Bottom | AnchorStyles.Right
            };
            btnShipOrder.Click += BtnShipOrder_Click;

            Controls.Add(lblUsers);
            Controls.Add(lblCart);
            Controls.Add(lblOrders);
            Controls.Add(lblOrderItems);
            Controls.Add(lblStatus);

            Controls.Add(listBoxUsers);
            Controls.Add(listBoxCart);
            Controls.Add(listBoxOrders);
            Controls.Add(listBoxOrderItems);

            Controls.Add(btnLoadUsers);
            Controls.Add(btnLoadCart);
            Controls.Add(btnLoadOrders);
            Controls.Add(btnRefreshAll);
            Controls.Add(comboOrderStatus);
            Controls.Add(btnUpdateOrderStatus);
            Controls.Add(btnShipOrder);

            autoRefreshTimer = new Timer();
            autoRefreshTimer.Interval = 5000;
            autoRefreshTimer.Tick += AutoRefreshTimer_Tick;
        }

        private async void FormUsers_Load(object sender, EventArgs e)
        {
            await RefreshAllSafeAsync();
            autoRefreshTimer.Start();
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
            await RefreshAllSafeAsync();
        }

        private async void BtnUpdateOrderStatus_Click(object sender, EventArgs e)
        {
            await UpdateSelectedOrderStatusAsync();
        }

        private async void BtnShipOrder_Click(object sender, EventArgs e)
        {
            await ShipSelectedOrderAsync();
        }

        private async void AutoRefreshTimer_Tick(object sender, EventArgs e)
        {
            await RefreshAllSafeAsync();
        }

        private async void ListBoxUsers_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (suppressUserSelectionChanged || isRefreshing)
                return;

            if (GetSelectedUserID() <= 0)
                return;

            await LoadSelectedUserCartAsync();
            await LoadSelectedUserOrdersAsync();

            listBoxOrderItems.Items.Clear();
            comboOrderStatus.SelectedIndex = -1;
        }

        private async void ListBoxOrders_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (suppressOrderSelectionChanged || isRefreshing)
                return;

            if (GetSelectedOrderID() <= 0)
                return;

            await LoadSelectedOrderItemsAsync();
        }

        private async Task RefreshAllSafeAsync()
        {
            if (isRefreshing)
                return;

            isRefreshing = true;
            autoRefreshTimer.Stop();

            try
            {
                int selectedUserId = GetSelectedUserID();
                int selectedOrderId = GetSelectedOrderID();

                await LoadUsersAsync(false);

                if (selectedUserId > 0)
                {
                    suppressUserSelectionChanged = true;
                    SelectUserById(selectedUserId);
                    suppressUserSelectionChanged = false;

                    await LoadSelectedUserCartAsync();
                    await LoadSelectedUserOrdersAsync(false);

                    if (selectedOrderId > 0)
                    {
                        suppressOrderSelectionChanged = true;
                        SelectOrderById(selectedOrderId);
                        suppressOrderSelectionChanged = false;

                        await LoadSelectedOrderItemsAsync();
                    }
                    else
                    {
                        listBoxOrderItems.Items.Clear();
                        comboOrderStatus.SelectedIndex = -1;
                    }
                }
                else
                {
                    listBoxCart.Items.Clear();
                    listBoxOrders.Items.Clear();
                    listBoxOrderItems.Items.Clear();
                    comboOrderStatus.SelectedIndex = -1;
                }
            }
            finally
            {
                isRefreshing = false;
                autoRefreshTimer.Start();
            }
        }

        private async Task LoadUsersAsync(bool clearDetails = true)
        {
            try
            {
                listBoxUsers.Items.Clear();

                if (clearDetails)
                {
                    listBoxCart.Items.Clear();
                    listBoxOrders.Items.Clear();
                    listBoxOrderItems.Items.Clear();
                    comboOrderStatus.SelectedIndex = -1;
                }

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

                        listBoxCart.Items.Add($"{item.nev} | {item.darab} db | {item.ar} Ft/db | Összesen: {total} Ft");
                    }

                    listBoxCart.Items.Add("--------------------------------------------------");
                    listBoxCart.Items.Add($"Kosár végösszeg: {vegosszeg} Ft");
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Hiba a kosár betöltése közben:\n" + ex.Message);
            }
        }

        private async Task LoadSelectedUserOrdersAsync(bool clearOrderItems = true)
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

                if (clearOrderItems)
                {
                    listBoxOrderItems.Items.Clear();
                    comboOrderStatus.SelectedIndex = -1;
                }

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
                        listBoxOrders.Items.Add(order);
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Hiba a rendelések betöltése közben:\n" + ex.Message);
            }
        }

        private async Task LoadSelectedOrderItemsAsync()
        {
            int orderID = GetSelectedOrderID();
            if (orderID <= 0)
            {
                listBoxOrderItems.Items.Clear();
                listBoxOrderItems.Items.Add("Válassz ki egy rendelést.");
                comboOrderStatus.SelectedIndex = -1;
                return;
            }

            try
            {
                listBoxOrderItems.Items.Clear();

                using (HttpClient client = CreateHttpClient())
                {
                    HttpResponseMessage response = await client.GetAsync($"http://localhost:3001/api/admin/order/{orderID}/details");
                    string responseBody = await response.Content.ReadAsStringAsync();

                    if (!response.IsSuccessStatusCode)
                    {
                        MessageBox.Show("Nem sikerült lekérni a rendelés termékeit.\n" + responseBody);
                        return;
                    }

                    AdminOrderDetailsResponse result = JsonConvert.DeserializeObject<AdminOrderDetailsResponse>(responseBody);

                    if (result == null || !result.success || result.data == null)
                    {
                        MessageBox.Show("Hibás válasz érkezett a szervertől a rendelés részleteinél.");
                        return;
                    }

                    comboOrderStatus.SelectedItem = result.data.allapot;

                    if (comboOrderStatus.SelectedIndex == -1 && !string.IsNullOrWhiteSpace(result.data.allapot))
                    {
                        comboOrderStatus.Items.Add(result.data.allapot);
                        comboOrderStatus.SelectedItem = result.data.allapot;
                    }

                    if (result.data.items == null || result.data.items.Length == 0)
                    {
                        listBoxOrderItems.Items.Add("Ehhez a rendeléshez nincs tétel.");
                        return;
                    }

                    int vegosszeg = 0;

                    foreach (AdminOrderItemDto item in result.data.items)
                    {
                        vegosszeg += item.osszeg;
                        listBoxOrderItems.Items.Add(
                            $"{item.nev} | {item.darab} db | {item.ar_akkor} Ft/db | Összesen: {item.osszeg} Ft"
                        );
                    }

                    listBoxOrderItems.Items.Add("--------------------------------------------------");
                    listBoxOrderItems.Items.Add($"Rendelés végösszeg: {vegosszeg} Ft");
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Hiba a rendelés termékeinek betöltése közben:\n" + ex.Message);
            }
        }

        private async Task UpdateSelectedOrderStatusAsync()
        {
            int orderID = GetSelectedOrderID();
            if (orderID <= 0)
            {
                MessageBox.Show("Először válassz ki egy rendelést.");
                return;
            }

            if (comboOrderStatus.SelectedItem == null)
            {
                MessageBox.Show("Válassz állapotot.");
                return;
            }

            try
            {
                using (HttpClient client = CreateHttpClient())
                {
                    var payload = new
                    {
                        allapot = comboOrderStatus.SelectedItem.ToString()
                    };

                    string json = JsonConvert.SerializeObject(payload);
                    StringContent content = new StringContent(json, Encoding.UTF8, "application/json");

                    HttpResponseMessage response = await client.PutAsync(
                        $"http://localhost:3001/api/admin/order/{orderID}/status",
                        content
                    );

                    string responseBody = await response.Content.ReadAsStringAsync();

                    if (!response.IsSuccessStatusCode)
                    {
                        MessageBox.Show("Nem sikerült módosítani az állapotot.\n" + responseBody);
                        return;
                    }

                    MessageBox.Show("Az állapot sikeresen módosítva.");

                    await LoadSelectedUserOrdersAsync(false);
                    suppressOrderSelectionChanged = true;
                    SelectOrderById(orderID);
                    suppressOrderSelectionChanged = false;
                    await LoadSelectedOrderItemsAsync();
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Hiba az állapot módosítása közben:\n" + ex.Message);
            }
        }

        private async Task ShipSelectedOrderAsync()
        {
            int orderID = GetSelectedOrderID();
            if (orderID <= 0)
            {
                MessageBox.Show("Először válassz ki egy rendelést.");
                return;
            }

            DialogResult dr = MessageBox.Show(
                "Biztosan kiküldöttnek jelölöd a rendelést?\nAz állapot Kiszállítva lesz.",
                "Megerősítés",
                MessageBoxButtons.YesNo,
                MessageBoxIcon.Question
            );

            if (dr != DialogResult.Yes)
                return;

            try
            {
                using (HttpClient client = CreateHttpClient())
                {
                    HttpResponseMessage response = await client.PostAsync(
                        $"http://localhost:3001/api/admin/order/{orderID}/ship",
                        new StringContent("", Encoding.UTF8, "application/json")
                    );

                    string responseBody = await response.Content.ReadAsStringAsync();

                    if (!response.IsSuccessStatusCode)
                    {
                        MessageBox.Show("Nem sikerült kiküldeni a rendelést.\n" + responseBody);
                        return;
                    }

                    MessageBox.Show("A rendelés állapota Kiszállítva lett.");

                    await LoadSelectedUserOrdersAsync(false);
                    suppressOrderSelectionChanged = true;
                    SelectOrderById(orderID);
                    suppressOrderSelectionChanged = false;
                    await LoadSelectedOrderItemsAsync();
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Hiba a kiküldés közben:\n" + ex.Message);
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

        private int GetSelectedOrderID()
        {
            if (listBoxOrders.SelectedItem is AdminOrderDto selectedOrder)
                return selectedOrder.orderID;

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

        private void SelectOrderById(int orderId)
        {
            for (int i = 0; i < listBoxOrders.Items.Count; i++)
            {
                if (listBoxOrders.Items[i] is AdminOrderDto order && order.orderID == orderId)
                {
                    listBoxOrders.SelectedIndex = i;
                    return;
                }
            }
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            if (autoRefreshTimer != null)
            {
                autoRefreshTimer.Stop();
                autoRefreshTimer.Dispose();
            }

            base.OnFormClosing(e);
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

    public class AdminOrderDetailsResponse
    {
        public bool success { get; set; }
        public AdminOrderDetailsDto data { get; set; }
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

        public override string ToString()
        {
            return $"#{orderID} | {datum:yyyy-MM-dd HH:mm} | {allapot} | {osszeg} Ft";
        }
    }

    public class AdminOrderDetailsDto
    {
        public int orderID { get; set; }
        public int userID { get; set; }
        public DateTime datum { get; set; }
        public string allapot { get; set; }
        public string mivel { get; set; }
        public AdminOrderItemDto[] items { get; set; }
    }

    public class AdminOrderItemDto
    {
        public int orderItemID { get; set; }
        public int pID { get; set; }
        public string nev { get; set; }
        public int darab { get; set; }
        public int ar_akkor { get; set; }
        public int osszeg { get; set; }
    }
}