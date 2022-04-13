import { useState, useEffect } from 'react'
import { useHistory, } from 'react-router'
import { useAuth } from '../contexts/Auth'
import { supabase } from '../supabase'
import Avatar from './Avatar'

export function Dashboard({ session }) {
  const { user, signOut } = useAuth()
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState(null)
  const [website, setWebsite] = useState(null)
  const [avatar_url, setAvatarUrl] = useState(null)
  const history = useHistory()

  useEffect(() => {
    getProfile()
  }, [session])

  async function getProfile() {
    try {
      setLoading(true)
      const user = supabase.auth.user()

      let { data, error } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url`)
        .eq('id', user.id)
        .single()

      if (error) {
        throw error
      }

      setUsername(data.username)
      setWebsite(data.website)
      setAvatarUrl(data.avatar_url)
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile({ username, website, avatar_url }) {
    try {
      setLoading(true)
      const user = supabase.auth.user()

      const updates = {
        id: user.id,
        username,
        website,
        avatar_url,
        updated_at: new Date(),
      }

      let { error } = await supabase.from('profiles').upsert(updates, {
        returning: 'minimal', // Don't return the value after inserting
      })

      if (error) {
        throw error
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    await signOut()

    history.push('/login')
  }

  return (
    <div className='form-widget'>
        <Avatar
        url={avatar_url}
        size={150}
        onUpload={(url) => {
            setAvatarUrl(url)
            updateProfile({ username, website, avatar_url: url })
        }}
        />
        <div style={{width: '150px' }}>
            <button
                className="button block primary"
                onClick={() => updateProfile({ username, website, avatar_url })}
                disabled={loading}
                >
                {loading ? 'Loading ...' : 'Update'}
            </button>
        </div>

      <p>Welcome, {user?.id}!</p>
      <button className="button block primary" 
              onClick={handleSignOut}>
                  Sign out
      </button>
    </div>
  )
}