# Performance Configuration for 20-30 Concurrent Judges

## Infrastructure Optimizations Applied

### Cloud Run Configuration
- **CPU**: 2 vCPUs (up from default 1)
- **Memory**: 2GB (up from default 512MB)
- **Min Instances**: 1 (warm start always available)
- **Max Instances**: 10 (handles traffic spikes)
- **Concurrency**: 50 requests per instance
- **Timeout**: 300 seconds (for complex judging operations)
- **Execution Environment**: gen2 (better performance)

### Resource Calculations
- **Target Load**: 30 concurrent users
- **Safety Factor**: 1.5x (45 concurrent capacity)
- **Requests per Instance**: 50
- **Expected Instances**: 1-2 under normal load
- **Peak Capacity**: 500 concurrent requests (10 instances × 50)

## Database Optimization Recommendations

### Immediate Actions Needed
1. **Enable Connection Pooling** in Supabase
   - Max connections: 100-200
   - Pool timeout: 30 seconds

2. **Add Database Indexes**
   ```sql
   -- Critical indexes for judging performance
   CREATE INDEX CONCURRENTLY idx_competition_entries_competition_id ON competition_entries(competition_id);
   CREATE INDEX CONCURRENTLY idx_judging_sessions_competition_id ON competition_judging_sessions(competition_id);
   CREATE INDEX CONCURRENTLY idx_judging_sessions_judge_id ON competition_judging_sessions(judge_id);
   CREATE INDEX CONCURRENTLY idx_competition_judges_competition_id ON competition_judges(competition_id, active);
   ```

3. **Optimize Queries**
   - Combine multiple queries into single calls where possible
   - Use `select` to limit returned fields
   - Implement pagination for large datasets

### Application-Level Caching
1. **Competition Data**: Cache for 5 minutes (rarely changes during judging)
2. **Entry Lists**: Cache for 2 minutes
3. **Judge Lists**: Cache for 1 minute
4. **User Profiles**: Cache for 10 minutes

## Monitoring & Alerts

### Cloud Run Metrics to Watch
- **Request Latency**: Keep under 2 seconds
- **Memory Utilization**: Keep under 80%
- **CPU Utilization**: Keep under 70%
- **Error Rate**: Keep under 1%
- **Instance Count**: Monitor scaling patterns

### Supabase Metrics
- **Connection Pool Usage**: Keep under 80%
- **Query Performance**: Watch for slow queries (>1s)
- **Database CPU**: Monitor during peak judging

## Load Testing Recommendations

Before the competition, test with:
1. **30 simultaneous users** browsing judging dashboard
2. **15 users** submitting scores simultaneously
3. **10 users** accessing entries page
4. **Peak scenario**: All 30 users active for 30 minutes

## Contingency Plans

### If Performance Degrades
1. **Scale up**: Increase to 4 CPU, 4GB RAM
2. **Horizontal scale**: Increase max-instances to 20
3. **Database**: Consider upgrading Supabase tier
4. **Caching**: Add Redis cache layer if needed

### Emergency Scaling Commands
```bash
# Quick scale up
gcloud run services update jax-points \
  --cpu=4 \
  --memory=4Gi \
  --max-instances=20 \
  --region=us-central1

# Quick scale down (after event)
gcloud run services update jax-points \
  --cpu=2 \
  --memory=2Gi \
  --max-instances=10 \
  --region=us-central1
```

## Cost Implications

### Estimated Monthly Costs (with optimizations)
- **Cloud Run**: ~$50-80/month with moderate usage
- **Cloud Storage**: ~$5/month
- **Cloud Build**: ~$10/month
- **Total**: ~$65-95/month (vs ~$20/month currently)

### Competition Day Costs
- **Peak usage**: ~$2-5 for the competition day
- **Auto-scaling**: Only pay for what you use
- **Recommend**: Monitor costs during first competition

## Implementation Priority

### High Priority (Do Before Competition)
1. ✅ Deploy optimized Cloud Run configuration
2. ✅ Update Dockerfile for production
3. 🔄 Add database indexes
4. 🔄 Test with 30+ concurrent users

### Medium Priority (Nice to Have)
- Application-level caching
- Real-time monitoring dashboard
- Automated alerting

### Low Priority (Future Improvements)
- CDN for static assets
- Database read replicas
- Advanced caching strategies