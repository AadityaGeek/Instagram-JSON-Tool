document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('insta-url');
    const publicTab = document.getElementById('public-tab');
    const privateTab = document.getElementById('private-tab');
    const publicActions = document.getElementById('public-actions');
    const fetchBtn = document.getElementById('fetch-btn');
    const loader = document.getElementById('loader');
    
    // Step sections
    const privateStep2 = document.getElementById('private-step-2');
    const privateStep3 = document.getElementById('private-step-3');
    const privateDataLink = document.getElementById('private-data-link');
    const graphqlUrlField = document.getElementById('graphql-url-field');
    const sourcePasteArea = document.getElementById('source-paste-area');
    
    const mediaPreviewCard = document.getElementById('media-preview-card');
    const mediaThumbnail = document.getElementById('media-thumbnail');
    const mediaType = document.getElementById('media-type');
    const downloadBtn = document.getElementById('download-btn');
    
    const step4 = document.getElementById('step-4');
    const jsonOutput = document.getElementById('json-output');
    
    const copyBtn = document.getElementById('copy-btn');
    const notification = document.getElementById('notification');

    const API_ENDPOINT = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/get-data'
        : 'https://instagram-json-extractor-backend.onrender.com/get-data';

    let currentMode = 'public';
    let discoveredDocId = '8845758582119845'; // Default fallback

    /**
     * Shows a professional notification toast.
     */
    const showNotification = (message) => {
        notification.textContent = message;
        notification.classList.remove('hidden');
        // Trigger reflow for transition
        void notification.offsetWidth;
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(20px)';
            setTimeout(() => { notification.classList.add('hidden'); }, 300);
        }, 3000);
    };

    /**
     * Attempts to fetch data directly from the user's browser session.
     * This works if the user is logged into Instagram in the same browser and CORS allows.
     */
    const fetchDirectly = async (graphqlUrl) => {
        try {
            const response = await fetch(graphqlUrl, {
                mode: 'cors',
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                processResult(data);
                showNotification('Automated Private Fetch Successful!');
                return true;
            }
        } catch (e) {
            console.log('Direct fetch restricted. Falling back to manual steps.');
        }
        return false;
    };

    /**
     * Updates the UI and generated link based on the provided URL.
     */
    const updatePrivateLink = async () => {
        const url = urlInput.value.trim();
        const shortcodeMatch = url.match(/(?:p|reel|reels|tv)\/([^\/?#&]+)/);
        
        if (shortcodeMatch) {
            const shortcode = shortcodeMatch[1];
            const variables = JSON.stringify({
                "shortcode": shortcode,
                "fetch_tagged_user_count": null,
                "hoisted_comment_id": null,
                "hoisted_reply_id": null
            });
            
            const privateUrl = `https://www.instagram.com/graphql/query/?doc_id=${discoveredDocId}&variables=${encodeURIComponent(variables)}`;
            privateDataLink.href = privateUrl;
            graphqlUrlField.value = privateUrl;

            if (currentMode === 'private') {
                // Auto-copy the link for the user
                navigator.clipboard.writeText(privateUrl).then(() => {
                    showNotification('GraphQL Link Auto-Copied!');
                }).catch(() => {});

                // Show manual steps by default in Private mode
                privateStep2.classList.remove('hidden');
                privateStep3.classList.remove('hidden');
                
                // Attempt automation in background
                loader.classList.remove('hidden');
                const success = await fetchDirectly(privateUrl);
                loader.classList.add('hidden');
                
                if (success) {
                    privateStep2.classList.add('hidden');
                    privateStep3.classList.add('hidden');
                }
            }
            return true;
        }
        return false;
    };

    /**
     * Handles mode switching between Public and Private.
     */
    const switchMode = async (mode) => {
        currentMode = mode;
        // Reset results when switching modes
        mediaPreviewCard.classList.add('hidden');
        step4.classList.add('hidden');
        
        if (mode === 'public') {
            publicTab.classList.add('active');
            privateTab.classList.remove('active');
            publicActions.classList.remove('hidden');
            privateStep2.classList.add('hidden');
            privateStep3.classList.add('hidden');
        } else {
            privateTab.classList.add('active');
            publicTab.classList.remove('active');
            publicActions.classList.add('hidden');
            await updatePrivateLink();
        }
    };

    /**
     * Processes JSON data, extracts media, and copies JSON to clipboard.
     */
    const processResult = (data) => {
        if (!data) return false;
        
        const rootData = data.data || data;
        const formattedJson = JSON.stringify(data, null, 2);
        jsonOutput.textContent = formattedJson;
        step4.classList.remove('hidden');

        // Auto-copy JSON to clipboard
        if (navigator.clipboard) {
            navigator.clipboard.writeText(formattedJson).then(() => {
                showNotification('JSON automatically copied!');
            }).catch(err => console.error('Auto-copy failed:', err));
        }

        try {
            const media = rootData.xdt_shortcode_media || rootData.shortcode_media || rootData.items?.[0] || rootData;
            if (!media) return true;

            const isVideo = media.is_video || !!media.video_versions;
            const downloadUrl = isVideo ? (media.video_url || media.video_versions?.[0]?.url) : (media.display_url || media.image_versions2?.candidates?.[0]?.url);
            const thumbUrl = media.display_url || media.thumbnail_src || media.image_versions2?.candidates?.[0]?.url;

            if (downloadUrl) {
                mediaThumbnail.src = thumbUrl;
                mediaThumbnail.classList.remove('hidden');
                mediaType.textContent = `Type: ${isVideo ? 'Video' : 'Image'}`;
                downloadBtn.href = downloadUrl;
                mediaPreviewCard.classList.remove('hidden');
                mediaPreviewCard.scrollIntoView({ behavior: 'smooth' });
            }
        } catch (e) {
            console.error('Media extraction failed:', e);
        }
        return true;
    };

    /**
     * Public Fetch logic via backend.
     */
    const fetchData = async () => {
        const url = urlInput.value.trim();
        if (!url) {
            showNotification('Please enter a URL first');
            return;
        }

        mediaPreviewCard.classList.add('hidden');
        step4.classList.add('hidden');
        loader.classList.remove('hidden');
        fetchBtn.disabled = true;

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            const result = await response.json();
            
            // Sync the discovered docId from backend for future private links
            if (result.doc_id) discoveredDocId = result.doc_id;

            if (result.data && Object.keys(result.data).length > 0) {
                processResult(result.data);
                showNotification('Data fetched successfully!');
            } else {
                throw new Error(result.error || 'Empty response. Try Private Mode.');
            }
        } catch (error) {
            showNotification('Error: ' + error.message);
        } finally {
            loader.classList.add('hidden');
            fetchBtn.disabled = false;
        }
    };

    // --- Listeners ---

    urlInput.addEventListener('input', async () => {
        if (currentMode === 'private') await updatePrivateLink();
    });

    publicTab.addEventListener('click', () => switchMode('public'));
    privateTab.addEventListener('click', () => switchMode('private'));
    fetchBtn.addEventListener('click', fetchData);

    // Copy functionality for small buttons
    document.querySelectorAll('.copy-small-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            if (targetId) {
                const targetElement = document.getElementById(targetId);
                const text = targetElement.tagName === 'INPUT' ? targetElement.value : targetElement.textContent;
                navigator.clipboard.writeText(text);
                showNotification('Copied to clipboard!');
            }
        });
    });

    // Link click behavior
    privateDataLink.addEventListener('click', () => {
        navigator.clipboard.writeText(privateDataLink.href);
        showNotification('Link opened & copied!');
        setTimeout(() => sourcePasteArea.focus(), 500);
    });

    // Manual paste processing
    sourcePasteArea.addEventListener('input', () => {
        const content = sourcePasteArea.value.trim();
        if (!content) return;
        try {
            const data = JSON.parse(content);
            if (processResult(data)) {
                sourcePasteArea.value = '';
                showNotification('Private data processed!');
            }
        } catch (e) { /* Wait for valid JSON */ }
    });

    // Final JSON copy button
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(jsonOutput.textContent);
        showNotification('JSON copied!');
    });
});
