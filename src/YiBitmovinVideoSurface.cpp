#include "YiBitmovinVideoSurface.h"

#include "YiBitmovinVideoPlayerPriv.h"

#define LOG_TAG "CYIBitmovinVideoSurface"

CYIBitmovinVideoSurface::CYIBitmovinVideoSurface(CYIBitmovinVideoPlayerPriv *pPlayerPriv)
    : CYIVideoSurfacePlatform(CYIVideoSurface::Capabilities::Translate | CYIVideoSurface::Capabilities::Scale)
    , m_pPlayerPriv(pPlayerPriv)
{
}

CYIBitmovinVideoSurface::~CYIBitmovinVideoSurface()
{
    m_pPlayerPriv = nullptr; // not owned by surface
}

void CYIBitmovinVideoSurface::SetVideoRectangle(const YI_RECT_REL &videoRectangle)
{
    m_pPlayerPriv->SetVideoRectangle(videoRectangle);
    SetSize(glm::ivec2(videoRectangle.width, videoRectangle.height));
}

void CYIBitmovinVideoSurface::OnAttached(CYIVideoSurfaceView *pVideoSurfaceView)
{
    CYIVideoSurfacePlatform::OnAttached(pVideoSurfaceView);
}

void CYIBitmovinVideoSurface::OnDetached(CYIVideoSurfaceView *pVideoSurfaceView)
{
    CYIVideoSurfacePlatform::OnDetached(pVideoSurfaceView);
}
