import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

type MetricState = {
  mrr: number;
  customers: number;
  churnRate: number;
  trialToPaid: number;
  cac: number;
  ltv: number;
  growthRate: number;
};

const mockMetrics: MetricState = {
  mrr: 74800,
  customers: 1248,
  churnRate: 2.9,
  trialToPaid: 23.6,
  cac: 312,
  ltv: 8420,
  growthRate: 5.2
};

const mockSales = [
  { id: 'INV-2201', account: 'Acme Labs', amount: 1499, status: 'paid' },
  { id: 'INV-2202', account: 'Northstar AI', amount: 999, status: 'paid' },
  { id: 'INV-2203', account: 'Vertex Commerce', amount: 2499, status: 'pending' }
];

const mockRegistrations = [
  { month: 'Jan', users: 85 },
  { month: 'Feb', users: 94 },
  { month: 'Mar', users: 103 },
  { month: 'Apr', users: 126 },
  { month: 'May', users: 134 },
  { month: 'Jun', users: 141 }
];

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState('admin@bolt.new');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [admins, setAdmins] = useState<string[]>(['owner@bolt.new', 'ops@bolt.new']);
  const [newAdmin, setNewAdmin] = useState('');

  const login = () => {
    if (email.toLowerCase().includes('admin') && password.length >= 6) {
      setLoggedIn(true);
      setError('');
      return;
    }
    setError('Use an admin email and password (6+ chars).');
  };

  const addAdmin = () => {
    const next = newAdmin.trim().toLowerCase();
    if (!next || !next.includes('@')) return;
    if (admins.includes(next)) return;
    setAdmins((prev) => [...prev, next]);
    setNewAdmin('');
  };

  const metrics = useMemo(
    () => [
      { label: 'Monthly Recurring Revenue (MRR)', value: `$${mockMetrics.mrr.toLocaleString()}` },
      { label: 'Number of customers', value: `${mockMetrics.customers}` },
      { label: 'Churn rate', value: `${mockMetrics.churnRate}%` },
      { label: 'Trial-to-paid conversion rate', value: `${mockMetrics.trialToPaid}%` },
      { label: 'Customer acquisition cost (CAC)', value: `$${mockMetrics.cac}` },
      { label: 'Lifetime value (LTV)', value: `$${mockMetrics.ltv.toLocaleString()}` },
      { label: 'Growth rate', value: `${mockMetrics.growthRate}%` }
    ],
    []
  );

  if (!loggedIn) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loginCard}>
          <Text style={styles.title}>Admin login</Text>
          <Text style={styles.subtitle}>React Native + Expo mobile dashboard access</Text>
          <TextInput
            style={styles.input}
            placeholder="admin@company.com"
            placeholderTextColor="#7f8aa3"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#7f8aa3"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.primaryButton} onPress={login}>
            <Text style={styles.primaryButtonText}>Login as admin</Text>
          </TouchableOpacity>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Advanced Admin Dashboard</Text>
        <Text style={styles.subtitle}>Measure what matters regularly</Text>

        {metrics.map((metric) => (
          <View key={metric.label} style={styles.metricCard}>
            <Text style={styles.metricLabel}>{metric.label}</Text>
            <Text style={styles.metricValue}>{metric.value}</Text>
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add user to admin</Text>
          <TextInput
            style={styles.input}
            placeholder="new-admin@company.com"
            placeholderTextColor="#7f8aa3"
            value={newAdmin}
            onChangeText={setNewAdmin}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.primaryButton} onPress={addAdmin}>
            <Text style={styles.primaryButtonText}>Add Admin</Text>
          </TouchableOpacity>
          {admins.map((admin) => (
            <Text key={admin} style={styles.listItem}>• {admin}</Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sales</Text>
          {mockSales.map((sale) => (
            <Text key={sale.id} style={styles.listItem}>
              {sale.id} · {sale.account} · ${sale.amount} · {sale.status}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User registrations</Text>
          {mockRegistrations.map((item) => (
            <View key={item.month} style={{ marginBottom: 8 }}>
              <Text style={styles.listItem}>{item.month}: {item.users}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${Math.min(100, (item.users / 150) * 100)}%` }]} />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#070c16' },
  container: { padding: 16, paddingBottom: 40 },
  loginCard: {
    margin: 16,
    marginTop: 80,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    backgroundColor: '#101827',
    padding: 16
  },
  title: { color: '#fff', fontSize: 28, fontWeight: '700' },
  subtitle: { color: '#94a3b8', marginTop: 4, marginBottom: 12, fontSize: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#1f2937',
    backgroundColor: '#0b1220',
    color: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10
  },
  primaryButton: {
    backgroundColor: '#2488f0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  errorText: { color: '#fca5a5', marginTop: 8 },
  metricCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
    backgroundColor: '#101827',
    padding: 14,
    marginTop: 10
  },
  metricLabel: { color: '#94a3b8', fontSize: 13 },
  metricValue: { color: '#fff', marginTop: 6, fontSize: 22, fontWeight: '700' },
  section: {
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
    backgroundColor: '#101827',
    padding: 14
  },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 8 },
  listItem: { color: '#cbd5e1', fontSize: 14, marginTop: 6 },
  barTrack: { height: 6, borderRadius: 999, backgroundColor: '#1f2937', marginTop: 4 },
  barFill: { height: 6, borderRadius: 999, backgroundColor: '#2488f0' }
});
