import React, { useState } from 'react';
import {
  Tile,
  Grid,
  Column,
  Button,
  Tag,
  TextInput,
  TextArea,
  Select,
  SelectItem,
  Tabs,
  TabList,
  Tab,
} from '@carbon/react';
import { Send, Warning, Partnership, Chat, Add } from '@carbon/icons-react';
import { useSisStore } from '../sisStore';

export const CommunicationsView: React.FC = () => {
  const { students, activeStudentId } = useSisStore();
  const activeStudent = students.find((s) => s.id === activeStudentId) || students[0];

  const [activeSubTab, setActiveSubTab] = useState(0);

  // Broad broadcast notices
  const [notices, setNotices] = useState([
    { id: '1', date: '2026-09-10', title: 'Ad-Hoc Holiday Announcement', type: 'Official Circular', body: 'The school will be closed on Sunday, Sept 15th, due to national public holidays.' },
    { id: '2', date: '2026-09-12', title: 'Severe Weather Warning', type: 'Emergency Alert', body: 'Flash floods expected. Classes will migrate to online distance learning.' },
  ]);

  // Chat thread messages
  const [messages, setMessages] = useState([
    { id: '1', sender: 'Teacher (Sarah Al-Waseem)', text: 'Hello, I wanted to discuss Zaid\'s progress in science.', time: '10:15 AM', reactions: [{ emoji: '👍', count: 2 }] },
    { id: '2', sender: 'Guardian (Mohammed bin Zaid)', text: 'Thank you Sarah, how did he do on his recent lab report?', time: '10:18 AM', reactions: [] },
    { id: '3', sender: 'Teacher (Sarah Al-Waseem)', text: 'He scored 88%! Excellent grasp of physics fundamentals.', time: '10:20 AM', reactions: [{ emoji: '🎉', count: 3 }, { emoji: '❤️', count: 1 }] },
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastType, setBroadcastType] = useState('Official Circular');
  const [broadcastBody, setBroadcastBody] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const newMsg = {
      id: Date.now().toString(),
      sender: 'Teacher (Admin)',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: [],
    };
    setMessages([...messages, newMsg]);
    setNewMessage('');
  };

  const handleAddReaction = (msgId: string, emoji: string) => {
    setMessages(messages.map(m => {
      if (m.id === msgId) {
        const existing = m.reactions.find(r => r.emoji === emoji);
        if (existing) {
          return {
            ...m,
            reactions: m.reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1 } : r),
          };
        } else {
          return {
            ...m,
            reactions: [...m.reactions, { emoji, count: 1 }],
          };
        }
      }
      return m;
    }));
  };

  const handleSendBroadcast = () => {
    if (!broadcastTitle.trim() || !broadcastBody.trim()) return;
    const newNot = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      title: broadcastTitle,
      type: broadcastType,
      body: broadcastBody,
    };
    setNotices([newNot, ...notices]);
    setBroadcastTitle('');
    setBroadcastBody('');
  };

  return (
    <div style={{ padding: '1rem 0' }}>
      <Tile style={{ marginBottom: '1.5rem', background: 'var(--cds-layer-01)', borderLeft: '4px solid var(--cds-interactive-01)' }}>
        <h3 style={{ margin: 0, fontWeight: 600 }}>Communications & SMS Hub</h3>
        <p style={{ margin: '0.25rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
          Broadcast ad-hoc SMS emergency alerts, post official circular guidelines, and participate in parent-teacher instant chat threads with emoji reactions.
        </p>
      </Tile>

      <div style={{ marginBottom: '1rem' }}>
        <Tabs selectedIndex={activeSubTab} onChange={({ selectedIndex }) => setActiveSubTab(selectedIndex)}>
          <TabList aria-label="Communications Sub Tabs">
            <Tab>Instant Parent-Teacher Chat</Tab>
            <Tab>Circular Bulletins & Emergency Broadcaster</Tab>
          </TabList>
        </Tabs>
      </div>

      {activeSubTab === 0 && (
        <Grid>
          <Column sm={4} md={4} lg={5}>
            <Tile style={{ padding: '1rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Active Chat Inboxes</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ padding: '0.75rem', background: 'var(--cds-layer-02)', borderLeft: '4px solid var(--cds-interactive-01)', cursor: 'pointer' }}>
                  <strong style={{ fontSize: '0.875rem' }}>Guardian: {activeStudent?.firstName} ({activeStudent?.studentNumber})</strong>
                  <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', margin: '0.25rem 0 0' }}>
                    Active thread: Lab report scores...
                  </p>
                </div>
                <div style={{ padding: '0.75rem', background: 'var(--cds-layer-01)', opacity: 0.7, cursor: 'not-allowed' }}>
                  <strong style={{ fontSize: '0.875rem' }}>Guardian: Sarah Al-Mikhlafi</strong>
                  <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', margin: '0.25rem 0 0' }}>
                    No recent message.
                  </p>
                </div>
              </div>
            </Tile>
          </Column>

          <Column sm={4} md={8} lg={11}>
            <Tile style={{ display: 'flex', flexDirection: 'column', height: '450px', justifyContent: 'space-between' }}>
              <div style={{ borderBottom: '1px solid var(--cds-border-subtle-01)', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontWeight: 600 }}>Thread with {activeStudent?.firstName}'s Family Guardian</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>Status: CONNECTED</span>
                </div>
                <Tag type="green" size="sm">SMS Link Sync Active</Tag>
              </div>

              {/* Message History */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.map((m) => (
                  <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignSelf: m.sender.includes('Teacher') ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                    <div style={{ background: m.sender.includes('Teacher') ? 'var(--cds-layer-02)' : 'var(--cds-interactive-01-theme-light, #e0e0e0)', color: 'var(--cds-text-primary)', padding: '0.75rem', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cds-text-secondary)', marginBottom: '0.25rem' }}>{m.sender}</div>
                      <div style={{ fontSize: '0.875rem' }}>{m.text}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>{m.time}</span>
                      <div style={{ display: 'flex', gap: '0.25rem', marginLeft: '0.5rem' }}>
                        {m.reactions.map((r, i) => (
                          <Tag type="cool-gray" size="sm" key={i} style={{ margin: 0 }}>{r.emoji} {r.count}</Tag>
                        ))}
                        <button style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.75rem' }} onClick={() => handleAddReaction(m.id, '👍')}>👍</button>
                        <button style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.75rem' }} onClick={() => handleAddReaction(m.id, '🎉')}>🎉</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--cds-border-subtle-01)', paddingTop: '0.75rem' }}>
                <TextInput
                  id="chat-text"
                  labelText=""
                  hideLabel
                  placeholder="Type an instant message, synced to Parent App and Guardian SMS..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                  style={{ flex: 1 }}
                />
                <Button kind="primary" hasIconOnly renderIcon={Send} onClick={handleSendMessage} iconDescription="Send Sync Message" />
              </div>
            </Tile>
          </Column>
        </Grid>
      )}

      {activeSubTab === 1 && (
        <Grid>
          <Column sm={4} md={8} lg={6}>
            <Tile>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Compose Broadcast Bulletin</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <TextInput
                  id="broad-title"
                  labelText="Bulletin / Alert Title"
                  placeholder="e.g. Ad-Hoc Examination Postponement"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                />
                <Select
                  id="broad-type"
                  labelText="Announcement Priority"
                  value={broadcastType}
                  onChange={(e) => setBroadcastType(e.target.value)}
                >
                  <SelectItem value="Official Circular" text="Official Circular Notice (Low)" />
                  <SelectItem value="Emergency Alert" text="Emergency Alert Broadcasting (SMS High)" />
                </Select>
                <TextArea
                  id="broad-body"
                  labelText="Message Body"
                  placeholder="Draft details here..."
                  value={broadcastBody}
                  onChange={(e) => setBroadcastBody(e.target.value)}
                />
                <Button kind="danger" renderIcon={Warning} onClick={handleSendBroadcast}>
                  Broadcast Outbound SMS / Alert
                </Button>
              </div>
            </Tile>
          </Column>

          <Column sm={4} md={8} lg={10}>
            <Tile style={{ height: '100%' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Dispatched Notification Trail</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {notices.map((not) => (
                  <Tile key={not.id} style={{ borderLeft: not.type.includes('Emergency') ? '4px solid var(--cds-support-01)' : '4px solid var(--cds-support-02)', background: 'var(--cds-layer-01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '0.875rem' }}>{not.title}</strong>
                      <Tag type={not.type.includes('Emergency') ? 'red' : 'green'} size="sm">{not.type}</Tag>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', marginBottom: '0.5rem' }}>{not.body}</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>Dispatched Date: {not.date}</span>
                  </Tile>
                ))}
              </div>
            </Tile>
          </Column>
        </Grid>
      )}
    </div>
  );
};
