const express = require('express');
const { pool } = require('../db');
const { auth } = require('./auth');
const router = express.Router();

// Get grades for a student
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT g.*, u.name as teacher_name
      FROM grades g
      LEFT JOIN users u ON g.teacher_id = u.id
      WHERE g.student_id = $1
      ORDER BY g.date DESC, g.created_at DESC
    `, [req.params.studentId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get grades for a group
router.get('/group/:groupId', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT g.*, s.name as student_name, u.name as teacher_name
      FROM grades g
      LEFT JOIN students s ON g.student_id = s.id
      LEFT JOIN users u ON g.teacher_id = u.id
      WHERE s.group_id = $1
      ORDER BY g.date DESC
    `, [req.params.groupId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add grade (teacher/admin)
router.post('/', auth, async (req, res) => {
  if (req.user.role === 'parent') return res.status(403).json({ error: 'غير مصرح' });
  const { student_id, type, value, max_value, title, notes, date } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO grades (student_id, teacher_id, type, value, max_value, title, notes, date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `, [student_id, req.user.id, type, value, max_value || 10, title, notes, date || new Date().toISOString().split('T')[0]]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update grade
router.put('/:id', auth, async (req, res) => {
  if (req.user.role === 'parent') return res.status(403).json({ error: 'غير مصرح' });
  const { value, max_value, title, notes } = req.body;
  try {
    const result = await pool.query(`
      UPDATE grades SET value=$1, max_value=$2, title=$3, notes=$4 WHERE id=$5 RETURNING *
    `, [value, max_value, title, notes, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete grade
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role === 'parent') return res.status(403).json({ error: 'غير مصرح' });
  try {
    await pool.query('DELETE FROM grades WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- NOTES ---

// Get notes for student
router.get('/notes/:studentId', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT n.*, u.name as teacher_name
      FROM teacher_notes n
      LEFT JOIN users u ON n.teacher_id = u.id
      WHERE n.student_id = $1
      ORDER BY n.date DESC, n.created_at DESC
    `, [req.params.studentId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add note
router.post('/notes', auth, async (req, res) => {
  if (req.user.role === 'parent') return res.status(403).json({ error: 'غير مصرح' });
  const { student_id, note, date } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO teacher_notes (student_id, teacher_id, note, date)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [student_id, req.user.id, note, date || new Date().toISOString().split('T')[0]]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete note
router.delete('/notes/:id', auth, async (req, res) => {
  if (req.user.role === 'parent') return res.status(403).json({ error: 'غير مصرح' });
  try {
    await pool.query('DELETE FROM teacher_notes WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
