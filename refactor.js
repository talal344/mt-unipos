const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'context', 'global-context.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Define tenant keys
const tenantKeys = [
  'unipos_products',
  'unipos_customers',
  'unipos_suppliers',
  'unipos_pos',
  'unipos_sales',
  'unipos_expenses',
  'unipos_employees',
  'unipos_tables',
  'unipos_kitchen',
  'unipos_accounts',
  'unipos_settings'
];

// 2. Replace all `localStorage.setItem` for these keys with `saveTenantData`
tenantKeys.forEach(key => {
  const regex = new RegExp(`localStorage\\.setItem\\("${key}",\\s*JSON\\.stringify\\(([^)]+)\\)\\);`, 'g');
  code = code.replace(regex, `saveTenantData("${key}", $1);`);
});

// 3. Insert `saveTenantData` right after `const [currentUser, setCurrentUser]`
const stateDecl = "const [currentUser, setCurrentUser] = useState<any>(null);";
const saveFunc = `
  const saveTenantData = (key: string, data: any) => {
    if (currentUser?.tenantId) {
      localStorage.setItem(\`\${key}_\${currentUser.tenantId}\`, JSON.stringify(data));
    }
  };
`;
code = code.replace(stateDecl, stateDecl + saveFunc);

// 4. Split useEffect.
// The current useEffect starts at `// Pre-seed mock data on first load`
// and ends with `// 14. Load Session User`
// We need to cut everything from `// 5. Load Products` up to `// 14. Load Session User`
// and put it in a separate useEffect that depends on `currentUser?.tenantId`.

const startMarker = "    // 5. Load Products";
const endMarker = "    // 14. Load Session User";

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
    console.log("Could not find markers!");
    process.exit(1);
}

const extractedBlock = code.substring(startIndex, endIndex);

// In the extracted block, we need to replace all `localStorage.getItem("key")`
// with `localStorage.getItem("key_" + currentUser.tenantId)`
let newBlock = extractedBlock;
tenantKeys.forEach(key => {
  newBlock = newBlock.replace(
    new RegExp(`localStorage\\.getItem\\("${key}"\\)`, 'g'),
    `localStorage.getItem("${key}_" + currentUser.tenantId)`
  );
  
  // also change the initial seed saving from localStorage.setItem to saveTenantData so it respects tenant
  newBlock = newBlock.replace(
    new RegExp(`localStorage\\.setItem\\("${key}",\\s*JSON\\.stringify\\(([^)]+)\\)\\);`, 'g'),
    `saveTenantData("${key}", $1);`
  );
});

// Wrap the newBlock in a new useEffect
const newUseEffect = `
  // Tenant Specific Data Load
  useEffect(() => {
    if (!currentUser?.tenantId) {
      // Clear data if no user is logged in
      setProducts([]);
      setCustomers([]);
      setSuppliers([]);
      setPurchaseOrders([]);
      setSales([]);
      setExpenses([]);
      setEmployees([]);
      setTables([]);
      setKitchenTickets([]);
      setAccounts([]);
      return;
    }

    const isPrimaryDemo = currentUser.tenantId === "TEN-101";

    // --- Start Extracted Block ---
${newBlock}
    // --- End Extracted Block ---

  }, [currentUser?.tenantId]);
`;

// Modify the extracted block to conditionally load init data ONLY if isPrimaryDemo
newBlock = newBlock.replace(/else \{/g, 'else if (isPrimaryDemo) {');

const finalNewUseEffect = `
  // Tenant Specific Data Load
  useEffect(() => {
    if (!currentUser?.tenantId) {
      // Clear data if no user is logged in
      setProducts([]);
      setCustomers([]);
      setSuppliers([]);
      setPurchaseOrders([]);
      setSales([]);
      setExpenses([]);
      setEmployees([]);
      setTables([]);
      setKitchenTickets([]);
      setAccounts([]);
      return;
    }

    const isPrimaryDemo = currentUser.tenantId === "TEN-101";

${newBlock}

  }, [currentUser?.tenantId]);
`;

code = code.substring(0, startIndex) + endMarker + code.substring(endIndex + endMarker.length);

// Insert the new useEffect right after the main useEffect closes
const mainEffectEnd = `  }, []);`;
code = code.replace(mainEffectEnd, mainEffectEnd + "\n" + finalNewUseEffect);


fs.writeFileSync(filePath, code);
console.log("Refactored successfully.");
