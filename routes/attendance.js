const express = require('express');
const { pool } = require('../db');
const { auth } = require('./auth');
const router = express.Router();

// Get attendance by group and date
router.get('/group/:groupId', auth, async (req, res) => {
  const { date } = req.query;
  try {
    const result = await pool.query(`
      SELECT s.id as student_id, s.name as student_name,
             a.status, a.id as attendance_id
      FROM students s
      LEFT JOIN attendance a ON a.student_id = s.id AND a.date = $1
      WHERE s.group_id = $2
      ORDER BY s.name
    `, [date || new Date().toISOString().split('T')[0], req.params.groupId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get student attendance history
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, u.name as teacher_name
      FROM attendance a
      LEFT JOIN users u ON a.teacher_id = u.id
      WHERE a.student_id = $1
      ORDER BY a.date DESC
      LIMIT 60
    `, [req.params.studentId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save attendance (teacher/admin)
router.post('/', auth, async (req, res) => {
  if (req.user.role === 'parent') return res.status(403).json({ error: 'غير مصرح' });
  const { student_id, date, status } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO attendance (student_id, date, status, teacher_id)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (student_id, date) DO UPDATE SET status = $3, teacher_id = $4
      RETURNING *
    `, [student_id, date, status, req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk save attendance
router.post('/bulk', auth, async (req, res) => {
  if (req.user.role === 'parent') return res.status(403).json({ error: 'غير مصرح' });
  const { records, date } = req.body; // records: [{student_id, status}]
  try {
    const promises = records.map(r => pool.query(`
      INSERT INTO attendance (student_id, date, status, teacher_id)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (student_id, date) DO UPDATE SET status = $3, teacher_id = $4
    `, [r.student_id, date, r.status, req.user.id]));
    await Promise.all(promises);
    res.json({ success: true, count: records.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Attendance stats for student
router.get('/stats/:studentId', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'present') as present,
        COUNT(*) FILTER (WHERE status = 'absent') as absent,
        COUNT(*) FILTER (WHERE status = 'late') as late,
        COUNT(*) as total
      FROM attendance WHERE student_id = $1
    `, [req.params.studentId]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
