import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Switch } from 'react-native';
import { readSelfCareLog, writeSelfCareLog, rollLog } from '../storage/selfcareLog';
import type { SelfCareLog, SelfCareLogDay, SelfCareRoutineStatus } from '../storage/types';

export const SelfCareLogViewer: React.FC = () => {
  const [log, setLog] = useState<SelfCareLog | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const fetchLog = async () => {
    await rollLog();
    const data = await readSelfCareLog();
    setLog(data);
  };

  useEffect(() => {
    fetchLog();
  }, []);

  if (!log) {
    return <Text style={styles.placeholder}>Loading log...</Text>;
  }

  const updateDay = async (date: string, updates: Partial<SelfCareLogDay>) => {
    if (!log) return;
    const newDays = log.days.map((d) => (d.date === date ? { ...d, ...updates } : d));
    const newLog = { ...log, days: newDays };
    await writeSelfCareLog(newLog);
    setLog(newLog);
  };

  const getStatusIcon = (status: SelfCareRoutineStatus | null) => {
    if (status === 'completed') return '✅';
    if (status === 'skipped') return '❌';
    if (status === 'partial') return '⚠️';
    return '⏳';
  };

  // Sort days descending (newest first)
  const sortedDays = [...log.days].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>7-Day Routine Log</Text>
      <Text style={styles.sectionSubtitle}>Tap a day to view or edit the routine status.</Text>
      
      {sortedDays.map((day) => {
        const isExpanded = expandedDay === day.date;
        return (
          <View key={day.date} style={styles.dayContainer}>
            <TouchableOpacity 
              style={styles.dayHeader} 
              onPress={() => setExpandedDay(isExpanded ? null : day.date)}
            >
              <View>
                <Text style={styles.dayDate}>{day.date}</Text>
                <Text style={styles.dayType}>{day.day_type.toUpperCase()}</Text>
              </View>
              <View style={styles.summaryIcons}>
                <Text style={styles.iconLabel}>☀️ {getStatusIcon(day.skincare_morning)}</Text>
                <Text style={styles.iconLabel}>🌙 {getStatusIcon(day.skincare_evening)}</Text>
              </View>
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.expandedContent}>
                <View style={styles.row}>
                  <Text style={styles.label}>Shaved</Text>
                  <Switch
                    value={day.shaved}
                    onValueChange={(val) => updateDay(day.date, { shaved: val })}
                    trackColor={{ false: '#374151', true: '#4f46e5' }}
                    thumbColor={day.shaved ? '#e5e7eb' : '#9ca3af'}
                  />
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Beard Routine</Text>
                  <Switch
                    value={day.beard_done}
                    onValueChange={(val) => updateDay(day.date, { beard_done: val })}
                    trackColor={{ false: '#374151', true: '#4f46e5' }}
                    thumbColor={day.beard_done ? '#e5e7eb' : '#9ca3af'}
                  />
                </View>
                {day.actives_used.length > 0 && (
                  <View style={styles.row}>
                    <Text style={styles.label}>Actives</Text>
                    <Text style={styles.activesText}>{day.actives_used.join(', ')}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f9fafb',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 16,
  },
  placeholder: {
    fontSize: 14,
    color: '#9ca3af',
  },
  dayContainer: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  dayDate: {
    fontSize: 15,
    fontWeight: '500',
    color: '#e5e7eb',
  },
  dayType: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  summaryIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconLabel: {
    fontSize: 14,
    color: '#e5e7eb',
  },
  expandedContent: {
    padding: 12,
    backgroundColor: '#0b1120',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  activesText: {
    fontSize: 13,
    color: '#818cf8',
    fontWeight: '500',
  },
});
