import fs from 'fs';
import path from 'path';
import https from 'https';

const assets = [
  // 3D feature icons
  { name: 'icon_analytics_3d.avif', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/69fd6a5870ed7d5cbe215c8f_cc14702a8a26588870591811e89a9766_Icon%20Container-6.avif' },
  { name: 'icon_card_3d.png', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/69fd6a579f6c144ad82fc1d0_Icon%20Container-5.png' },
  { name: 'icon_piggy_3d.webp', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/69fd6a586ac8bff61962b147_f162c657cf3d2ceaaf170416da858dcb_Icon%20Container-3.webp' },
  { name: 'icon_bomb_3d.png', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/69fd6a575c51ac6302e79bf1_Icon%20Container-7.png' },
  { name: 'icon_graph_3d.png', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/69fd6a57a29e11ad6e9adf35_Icon%20Container-1.png' },
  { name: 'icon_folder_3d.png', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/69fd6a579f904b3c49f79632_Icon%20Container.png' },
  { name: 'icon_share_3d.png', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/69fd6a573e5bc3f756c20f82_Icon%20Container-4.png' },
  { name: 'icon_magic_3d.png', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/69d776bc9956490adcfbfc7d_2d8554f066b80e4bc0814ab95bed2e4b_magic%20icon.png' },
  { name: 'icon_silver_crown.png', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/697b6ce8aefdc20ec5adb257_img_light_pricing.png' },
  { name: 'icon_gold_crown.avif', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/697bd6abf0f3328d240efc3a_img_premium_pricing.avif' },
  { name: 'icon_business_crown.avif', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/6a3e21105056a1ce1942ca15_img_business_premium.avif' },
  { name: 'icon_magic_ball.avif', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/69d8ab5c9bcdf0eeb98635eb_ab78fd4235f26bf77f6b51f6694192e5_img_magic_ball.avif' },
  { name: 'icon_transactions.avif', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/697a6870d78cbd9b98daf12a_img_transactions.avif' },
  { name: 'icon_categories.avif', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/6a3bda07df890e031f4967b2_img_categories.avif' },

  // Awards and Badges
  { name: 'awards_all_cluster.png', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/6a6b5d9ef2bfba7faf79948c_all%20awards.png' },
  { name: 'award_site_of_the_day.webp', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/6a675695839513f636a67fc7_site_of_the_day_2026.webp' },
  { name: 'award_web_design.avif', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/6a639931b3ca522a1f9ede10_e24da324ea6c2a7858c10473e654f71c_web%20design%20award.avif' },
  { name: 'award_woty.avif', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/6a3a9ad05216b962f45ac0cf_WOTY%20website%20black-certified2026%20ENG%201.avif' },
  { name: 'award_german_design.avif', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/6a3a9ad0a1c838449847b80b_awards-german-design-logo.avif' },
  { name: 'award_emerce.avif', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/6a3a9ad01fbea556f6250ffa_awards-emerce-logo.avif' },
  { name: 'award_webby.avif', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/6a3a9ad0d964edb2a4a828b7_Webby%202024%20Nomination-1.avif' },
  { name: 'award_if_design.avif', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/6a3a9ad05216b962f45ac0d2_iF%20DESIGN%20AWARD%202024_p_RGB.edge%201.avif' },
  { name: 'award_cup_trophy.avif', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/6a3a9bc706f1dec7183b5fc5_cup%2002.avif' },

  // UI mockups & cards
  { name: 'card_budgets.avif', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/69d8ce54c1ff503e03b00282_Budgets.avif' },
  { name: 'card_accounts.avif', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/69d8ce5472152bb89fb905ba_Accounts.avif' },
  { name: 'card_analysis.avif', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/69d8ce54d014eeab5361e0e2_Analysis.avif' },
  { name: 'card_saving_goals.avif', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/69d8ce5497e94c2934411824_Saving%20goals.avif' },
  { name: 'card_reports.avif', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/69d8ce546f518119409d8d4b_Reports.avif' },
  { name: 'card_loyalty.avif', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/69d8ce554464dc9a9082d61e_Loyalty%20cards.avif' },
  { name: 'card_contracts.avif', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/69d8ce5469d6d83d31685d4c_Contracts%20%26%20Agreements%20storage.avif' },
  { name: 'card_debts.png', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/69fd9c7e0e9889939ba28e36_Debts%20and%20Loans.png' },
  { name: 'card_intelligence.png', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/69fd9c7ec0d305bf40d664a2_Grassfeld%20Intelligence.png' },
  { name: 'device_mobile_model.avif', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/69d8c2dbb2864cfe815b7671_Mobile%20App%20Image.avif' },
  { name: 'device_computer_model.avif', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/69d8c2db3acb8e932746435d_img_computer.avif' },

  // UI buttons and badges
  { name: 'btn_app_store.png', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/664f62e4a83d2de4493bfdb1_Download%20Button.png' },
  { name: 'btn_google_play.png', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/664f62e49676e029fd18e324_Download%20Button-1.png' },
  { name: 'icon_notification_bell.avif', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/6a3aaab13fcaef76a5ef9cb3_Notification%20Icon.avif' },
  { name: 'flag_usa.avif', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/6a3a80d5aacdea39350acba8_usa.avif' },
  { name: 'flag_canada.avif', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/6a3a80d52ed0d1340cbebaca_canada.avif' },
  { name: 'flag_eu.avif', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/6a3a80d573e120f24ad4fa9b_eu.avif' },
  { name: 'flag_uk.avif', url: 'https://cdn.prod.website-files.com/664b4791c7855e5b87d45e83/6a3a80d51c2ee5436c2436aa_uk.avif' },
];

const targetDir = path.resolve('j:/Dev/PROJECTS/CuraVeris/web/public/assets/scraped');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      } else {
        file.close();
        fs.unlink(dest, () => {});
        reject(new Error(`Failed with status: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  console.log(`Starting download of ${assets.length} assets...`);
  for (const asset of assets) {
    const dest = path.join(targetDir, asset.name);
    try {
      await downloadFile(asset.url, dest);
      console.log(`✓ Downloaded: ${asset.name}`);
    } catch (e) {
      console.error(`✗ Error downloading ${asset.name}: ${e.message}`);
    }
  }
  console.log('All downloads completed!');
}

run();
