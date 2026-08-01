const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Read .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseAnonKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTest() {
  console.log('Testing Supabase Connection & RLS Policies...');

  // Test 1: Insert a Customer (User)
  const testCustomer = [
    {
      id: "C-9999",
      name: "Auto-Test Customer",
      customerNo: "CUST-9999",
      loyaltyPoints: 0,
      creditBalance: 0
    }
  ];

  console.log('\n--- 1. Testing Customer Sync ---');
  const custRes = await supabase.from('unipos_collections').upsert({
    tenant_id: 'T-TEST-123',
    collection: 'unipos_customers',
    item_id: 'all',
    data: testCustomer
  }).select();
  
  if (custRes.error) {
    console.error('Customer Sync Failed:', custRes.error);
  } else {
    console.log('Customer Sync Success! Row:', custRes.data[0].collection);
  }

  // Test 2: Insert a Product
  const testProduct = [
    {
      id: "P-9999",
      name: "Auto-Test Product",
      price: 500,
      cost: 250,
      stock: 50,
      sku: "SKU-TEST",
      category: "Testing"
    }
  ];

  console.log('\n--- 2. Testing Product Sync ---');
  const prodRes = await supabase.from('unipos_collections').upsert({
    tenant_id: 'T-TEST-123',
    collection: 'unipos_products',
    item_id: 'all',
    data: testProduct
  }).select();

  if (prodRes.error) {
    console.error('Product Sync Failed:', prodRes.error);
  } else {
    console.log('Product Sync Success! Row:', prodRes.data[0].collection);
  }

  // Test 3: Fetch Data Back
  console.log('\n--- 3. Testing Fetch from Supabase ---');
  const fetchRes = await supabase.from('unipos_collections')
    .select('*')
    .eq('tenant_id', 'T-TEST-123');

  if (fetchRes.error) {
    console.error('Fetch Failed:', fetchRes.error);
  } else {
    console.log(`Fetch Success! Retrieved ${fetchRes.data.length} collections.`);
    console.log('Product Data retrieved:', fetchRes.data.find(d => d.collection === 'unipos_products').data[0].name);
  }
}

runTest();
