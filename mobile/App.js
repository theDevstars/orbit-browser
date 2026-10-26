import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity as T, Modal, ScrollView, ImageBackground, Switch, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as IP from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

const D = { accent: '#a78bfa', dark: true, wall: '#101114', img: null, rad: 16, name: '' };
const WALLS = ['#101114', '#191a20', '#262730', '#e9eaf0', '#f4f4f6', '#e8e2d9'];
const ACC = ['#a78bfa', '#6ee7d2', '#ff9f80', '#f4ca66', '#83a8ff', '#7885d0'];
const DM = [['DuckDuckGo', 'https://duckduckgo.com/'], ['YouTube', 'https://www.youtube.com/'], ['GitHub', 'https://github.com/'], ['Reddit', 'https://www.reddit.com/'], ['Figma', 'https://www.figma.com/']];
let nid = 1;
const mkTab = () => ({ id: nid++, uri: '', cur: '', title: 'New tab', back: false, fwd: false });
const host = u => u.replace(/^https?:\/\/(www\.)?/, '').split(/[/?#]/)[0];
const norm = s => {
  s = s.trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  if (/^[^\s]+\.[a-z]{2,}(\/.*)?$/i.test(s)) return 'https://' + s;
  return 'https://duckduckgo.com/?q=' + encodeURIComponent(s);
};

function Browser() {
  const ins = useSafeAreaInsets();
  const first = useRef(mkTab()).current;
  const [S, setS] = useState(D);
  const [marks, setMarks] = useState(DM);
  const [tabs, setTabs] = useState([first]);
  const [aid, setAid] = useState(first.id);
  const [ready, setReady] = useState(false);
  const [edit, setEdit] = useState(false);
  const [text, setText] = useState('');
  const [showSet, setShowSet] = useState(false);
  const [showTabs, setShowTabs] = useState(false);
  const [, tick] = useState(0);
  const refs = useRef({});

  useEffect(() => {
    AsyncStorage.getItem('orbit')
      .then(v => {
        if (v) {
          const j = JSON.parse(v);
          if (j.S) setS({ ...D, ...j.S });
          if (j.marks) setMarks(j.marks);
        }
      })
      .catch(() => {})
      .finally(() => setReady(true));
    const i = setInterval(() => tick(x => x + 1), 30000);
    return () => clearInterval(i);
  }, []);
  useEffect(() => {
    if (ready) AsyncStorage.setItem('orbit', JSON.stringify({ S, marks })).catch(() => {});
  }, [S, marks, ready]);

  useEffect(() => {
    const open = u => {
      if (!u || !/^https?:/i.test(u)) return;
      const t = { ...mkTab(), uri: u, cur: u, title: host(u) };
      setTabs(ts => [...ts, t]);
      setAid(t.id);
    };
    Linking.getInitialURL().then(open).catch(() => {});
    const sub = Linking.addEventListener('url', e => open(e.url));
    return () => sub.remove();
  }, []);

  const tab = tabs.find(t => t.id === aid) || tabs[0];
  const up = (id, p) => setTabs(ts => ts.map(t => (t.id === id ? { ...t, ...p } : t)));
  const go = raw => {
    const u = norm(raw);
    if (u) up(tab.id, { uri: u, cur: u, title: host(u) });
  };
  const newTab = () => {
    const t = mkTab();
    setTabs([...tabs, t]);
    setAid(t.id);
    setShowTabs(false);
  };
  const closeTab = id => {
    if (tabs.length === 1) {
      const t = mkTab();
      setTabs([t]);
      setAid(t.id);
      return;
    }
    const rest = tabs.filter(t => t.id !== id);
    setTabs(rest);
    if (aid === id) setAid(rest[rest.length - 1].id);
  };
  const back = () => (tab.back ? refs.current[tab.id]?.goBack() : up(tab.id, { uri: '', cur: '', title: 'New tab' }));
  const pinned = marks.some(m => m[1] === tab.cur);
  const star = () => setMarks(pinned ? marks.filter(m => m[1] !== tab.cur) : [...marks, [tab.title, tab.cur]]);
  const pick = async () => {
    const r = await IP.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!r.canceled) setS({ ...S, img: r.assets[0].uri });
  };

  const dk = S.dark;
  const ink = dk ? '#eceef9' : '#17192b';
  const muted = dk ? '#a3a9cf' : '#5d6385';
  const glass = dk ? 'rgba(22,23,34,.88)' : 'rgba(255,255,255,.88)';
  const line = dk ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.1)';
  const Btn = ({ l, f, off }) => (
    <T onPress={f} disabled={off} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', opacity: off ? 0.3 : 1 }}>
      <Text style={{ color: ink, fontSize: 21 }}>{l}</Text>
    </T>
  );
  const Chip = ({ l, on, f }) => (
    <T onPress={f} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, borderWidth: 1, borderColor: on ? S.accent : line, backgroundColor: on ? S.accent : 'transparent', marginRight: 8, marginBottom: 8 }}>
      <Text style={{ color: on ? '#fff' : ink }}>{l}</Text>
    </T>
  );
  const Sw = ({ c, on, f }) => (
    <T onPress={f} style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: c, borderWidth: 2, borderColor: on ? ink : 'transparent', marginRight: 8, marginBottom: 8 }} />
  );
  const H = ({ t }) => <Text style={{ color: muted, fontSize: 12, fontWeight: '600', marginTop: 20, marginBottom: 8 }}>{t}</Text>;

  const hr = new Date().getHours();
  const greet = (hr < 5 ? 'Good night' : hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening') + (S.name ? ', ' + S.name : '');
  const date = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  return (
    <ImageBackground source={S.img ? { uri: S.img } : undefined} style={{ flex: 1, backgroundColor: S.wall, paddingTop: ins.top + 6, paddingHorizontal: 6, paddingBottom: ins.bottom + 6 }}>
      <StatusBar style={dk ? 'light' : 'dark'} />
      <View style={{ flex: 1, borderRadius: S.rad, overflow: 'hidden' }}>
        {tabs.map(t =>
          t.uri ? (
            <WebView
              key={t.id}
              ref={r => (refs.current[t.id] = r)}
              source={{ uri: t.uri }}
              pullToRefreshEnabled
              style={{ flex: 1, display: t.id === tab.id ? 'flex' : 'none' }}
              onNavigationStateChange={n => up(t.id, { cur: n.url, title: n.title || host(n.url), back: n.canGoBack, fwd: n.canGoForward })}
            />
          ) : null
        )}
        {!tab.uri && (
          <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 30, flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
            <View style={{ backgroundColor: glass, borderRadius: S.rad + 6, padding: 22, alignItems: 'stretch' }}>
              <Text style={{ color: muted, fontSize: 11, fontWeight: '600', letterSpacing: 1.4, marginBottom: 12 }}>{date.toUpperCase()}</Text>
              <Text style={{ color: ink, fontSize: 34, fontWeight: '600', letterSpacing: -1 }}>Search the web</Text>
              <Text style={{ color: muted, fontSize: 14, marginTop: 6, marginBottom: 18 }}>Find a page or pick up where you left off.</Text>
              <TextInput
                placeholder="Search DuckDuckGo or enter a web address"
                placeholderTextColor={muted}
                returnKeyType="go"
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={e => go(e.nativeEvent.text)}
                style={{ alignSelf: 'stretch', height: 46, borderRadius: 99, borderWidth: 1, borderColor: line, color: ink, paddingHorizontal: 18, fontSize: 16, marginTop: 10 }}
              />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 20 }}>
                {marks.map((m, i) => (
                  <T key={i} onPress={() => go(m[1])} style={{ width: 138, alignItems: 'flex-start', padding: 9, flexDirection: 'row', gap: 10, borderRadius: 12, borderWidth: 1, borderColor: line, backgroundColor: 'rgba(255,255,255,0.025)' }}>
                    <View style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: S.accent, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>{(m[0][0] || '?').toUpperCase()}</Text>
                    </View>
                    <Text numberOfLines={1} style={{ color: ink, fontSize: 12, marginTop: 0, flexShrink: 1 }}>{m[0]}</Text>
                  </T>
                ))}
              </View>
            </View>
          </ScrollView>
        )}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: glass, borderRadius: S.rad, marginTop: 6, padding: 5 }}>
        <Btn l="‹" f={back} off={!tab.uri} />
        {tab.fwd && <Btn l="›" f={() => refs.current[tab.id]?.goForward()} />}
        <TextInput
          value={edit ? text : tab.cur ? host(tab.cur) : ''}
          onChangeText={setText}
          onFocus={() => { setText(tab.cur); setEdit(true); }}
          onBlur={() => setEdit(false)}
          onSubmitEditing={() => { go(text); setEdit(false); }}
          placeholder="Search DuckDuckGo or enter address"
          placeholderTextColor={muted}
          selectTextOnFocus
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="go"
          style={{ flex: 1, height: 40, borderRadius: 99, borderWidth: 1, borderColor: line, color: ink, paddingHorizontal: 14, fontSize: 16, textAlign: edit ? 'left' : 'center', marginHorizontal: 4 }}
        />
        <Btn l={pinned ? '★' : '☆'} f={star} off={!tab.cur} />
        <T onPress={() => setShowTabs(true)} style={{ width: 30, height: 30, borderRadius: 9, borderWidth: 2, borderColor: ink, alignItems: 'center', justifyContent: 'center', marginHorizontal: 5 }}>
          <Text style={{ color: ink, fontWeight: '600', fontSize: 13 }}>{tabs.length}</Text>
        </T>
        <Btn l="⚙" f={() => setShowSet(true)} />
      </View>

      <Modal visible={showTabs} animationType="slide" onRequestClose={() => setShowTabs(false)}>
        <View style={{ flex: 1, backgroundColor: dk ? '#14151f' : '#f6f7fb', paddingTop: ins.top + 14, paddingHorizontal: 14, paddingBottom: ins.bottom + 14 }}>
          <T onPress={() => setShowTabs(false)} style={{ alignSelf: 'flex-end', padding: 10 }}><Text style={{ color: S.accent, fontSize: 17, fontWeight: '600' }}>Done</Text></T>
          <ScrollView>
            {tabs.map(t => (
              <T key={t.id} onPress={() => { setAid(t.id); setShowTabs(false); }} style={{ flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, marginBottom: 6, backgroundColor: t.id === tab.id ? glass : 'transparent', borderWidth: 1, borderColor: t.id === tab.id ? S.accent : line }}>
                <Text numberOfLines={1} style={{ flex: 1, color: ink, fontSize: 16 }}>{t.title}</Text>
                <T onPress={() => closeTab(t.id)} hitSlop={12}><Text style={{ color: muted, fontSize: 22 }}>×</Text></T>
              </T>
            ))}
            <T onPress={newTab} style={{ padding: 14 }}><Text style={{ color: S.accent, fontSize: 16 }}>+ New tab</Text></T>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={showSet} animationType="slide" onRequestClose={() => setShowSet(false)}>
        <ScrollView style={{ flex: 1, backgroundColor: dk ? '#14151f' : '#f6f7fb' }} contentContainerStyle={{ padding: 18, paddingTop: ins.top + 14, paddingBottom: ins.bottom + 30 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: ink, fontSize: 20, fontWeight: '600' }}>Customize</Text>
            <T onPress={() => setShowSet(false)} style={{ padding: 10 }}><Text style={{ color: S.accent, fontSize: 17, fontWeight: '600' }}>Done</Text></T>
          </View>
          <H t="DARK MODE" />
          <Switch value={dk} onValueChange={v => setS({ ...S, dark: v })} trackColor={{ true: S.accent }} />
          <H t="WALLPAPER" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {WALLS.map(c => <Sw key={c} c={c} on={!S.img && S.wall === c} f={() => setS({ ...S, wall: c, img: null })} />)}
          </View>
          <Chip l="Choose photo" f={pick} />
          <H t="ACCENT COLOR" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {ACC.map(c => <Sw key={c} c={c} on={S.accent === c} f={() => setS({ ...S, accent: c })} />)}
          </View>
          <H t="CORNER RADIUS" />
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Chip l="−" f={() => setS({ ...S, rad: Math.max(0, S.rad - 4) })} />
            <Text style={{ color: ink, marginRight: 14, marginBottom: 8 }}>{S.rad}</Text>
            <Chip l="+" f={() => setS({ ...S, rad: Math.min(28, S.rad + 4) })} />
          </View>
          <H t="START PAGE" />
          <TextInput value={S.name} onChangeText={v => setS({ ...S, name: v.slice(0, 30) })} placeholder="Your name" placeholderTextColor={muted} style={{ height: 44, borderRadius: 10, borderWidth: 1, borderColor: line, color: ink, paddingHorizontal: 12, fontSize: 16 }} />
          <View style={{ marginTop: 20 }}><Chip l="Reset all" f={() => setS(D)} /></View>
        </ScrollView>
      </Modal>
    </ImageBackground>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Browser />
    </SafeAreaProvider>
  );
}
