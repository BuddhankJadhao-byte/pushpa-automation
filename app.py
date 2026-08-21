import streamlit as st
import streamlit.components.v1 as components
import os

# Configure Streamlit Page
st.set_page_config(
    page_title="Pushpa Automation & Robotics Industries",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom Streamlit Theme Overrides to maximize iframe viewport
st.markdown("""
    <style>
        #MainMenu {visibility: hidden;}
        footer {visibility: hidden;}
        header {visibility: hidden;}
        .block-container {
            padding: 0rem !important;
            margin: 0rem !important;
            max-width: 100% !important;
        }
        iframe {
            border: none !important;
            width: 100% !important;
        }
    </style>
""", unsafe_allow_html=True)

def load_bundled_html():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Read files
    with open(os.path.join(base_dir, "index.html"), "r", encoding="utf-8") as f:
        html_content = f.read()
    with open(os.path.join(base_dir, "styles.css"), "r", encoding="utf-8") as f:
        css_content = f.read()
    with open(os.path.join(base_dir, "sound-fx.js"), "r", encoding="utf-8") as f:
        sound_js = f.read()
    with open(os.path.join(base_dir, "sensor-engine.js"), "r", encoding="utf-8") as f:
        sensor_js = f.read()
    with open(os.path.join(base_dir, "app.js"), "r", encoding="utf-8") as f:
        app_js = f.read()

    # Inline CSS
    html_content = html_content.replace(
        '<link rel="stylesheet" href="styles.css">',
        f'<style>{css_content}</style>'
    )

    # Inline JS scripts
    script_bundle = f"""
    <script>{sound_js}</script>
    <script>{sensor_js}</script>
    <script>{app_js}</script>
    """
    html_content = html_content.replace(
        '<script src="sound-fx.js"></script>\n  <script src="sensor-engine.js"></script>\n  <script src="app.js"></script>',
        script_bundle
    ).replace(
        '<script src="sound-fx.js"></script>', ''
    ).replace(
        '<script src="sensor-engine.js"></script>', ''
    ).replace(
        '<script src="app.js"></script>', script_bundle
    )

    return html_content

# Render the self-contained sensory interactive web app
bundled_html = load_bundled_html()
components.html(bundled_html, height=2800, scrolling=True)
