using System;
using System.Net.Http;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace RenetatoExecutorValidator
{
    public partial class Form1 : Form
    {
        private TextBox keyTextBox;
        private Button validateButton;
        private Label statusLabel;
        private static readonly HttpClient client = new HttpClient();

        public Form1()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            this.keyTextBox = new TextBox();
            this.validateButton = new Button();
            this.statusLabel = new Label();
            this.SuspendLayout();

            // keyTextBox
            this.keyTextBox.Location = new System.Drawing.Point(50, 50);
            this.keyTextBox.Size = new System.Drawing.Size(300, 23);
            this.keyTextBox.PlaceholderText = "Enter your key here...";

            // validateButton
            this.validateButton.Location = new System.Drawing.Point(370, 50);
            this.validateButton.Size = new System.Drawing.Size(100, 25);
            this.validateButton.Text = "Validate";
            this.validateButton.UseVisualStyleBackColor = true;
            this.validateButton.Click += new EventHandler(this.ValidateButton_Click);

            // statusLabel
            this.statusLabel.Location = new System.Drawing.Point(50, 100);
            this.statusLabel.Size = new System.Drawing.Size(400, 23);
            this.statusLabel.Text = "Enter a key and click Validate";

            // Form1
            this.ClientSize = new System.Drawing.Size(500, 200);
            this.Controls.Add(this.keyTextBox);
            this.Controls.Add(this.validateButton);
            this.Controls.Add(this.statusLabel);
            this.Text = "Renetato Executor Key Validator";
            this.ResumeLayout(false);
        }

        private async void ValidateButton_Click(object sender, EventArgs e)
        {
            string key = keyTextBox.Text.Trim();
            
            if (string.IsNullOrEmpty(key))
            {
                statusLabel.Text = "Please enter a key";
                statusLabel.ForeColor = System.Drawing.Color.Red;
                return;
            }

            validateButton.Enabled = false;
            statusLabel.Text = "Validating...";
            statusLabel.ForeColor = System.Drawing.Color.Blue;

            try
            {
                string result = await ValidateKey(key);
                
                if (result == "VALID")
                {
                    statusLabel.Text = "✓ Key is valid and has been activated!";
                    statusLabel.ForeColor = System.Drawing.Color.Green;
                    
                    // Here you can proceed with your executor logic
                    // ExecutorLogic.Start();
                }
                else
                {
                    statusLabel.Text = "✗ Invalid key or key already used/expired";
                    statusLabel.ForeColor = System.Drawing.Color.Red;
                }
            }
            catch (Exception ex)
            {
                statusLabel.Text = $"Error: {ex.Message}";
                statusLabel.ForeColor = System.Drawing.Color.Red;
            }
            finally
            {
                validateButton.Enabled = true;
            }
        }

        private async Task<string> ValidateKey(string key)
        {
            string url = $"https://renetato.vercel.app/api/validate?key={key}";
            
            HttpResponseMessage response = await client.GetAsync(url);
            string result = await response.Content.ReadAsStringAsync();
            
            return result;
        }
    }

    static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new Form1());
        }
    }
}
